import { DemoNotice } from '../components/common/DemoNotice';
import { addDaysISO, todayISO } from '../utils/today';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Calendar,
  ArrowRight,
  Flame,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PriorityPill } from '../components/common/StatusPill';
import { aiService, AIScheduleProposal, MissedTaskSuggestion } from '../services/aiService';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  proposal?: AIScheduleProposal;
  missedRecovery?: MissedTaskSuggestion;
}

export const AIPlanner: React.FC = () => {
  const { tasks, updateTask, postponeTask, user } = useApp();
  const navigate = useNavigate();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProposal, setActiveProposal] = useState<AIScheduleProposal | null>(null);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: `Hello ${user.name.split(' ')[0] || 'there'}! I'm your daily planner. Tell me how many hours you have free today (for example "I have 3 hours"), and I will arrange your open tasks around the fixed items that already have a time.`,
    },
  ]);

  // Offer to move the most important overdue task, once, using only facts from your task list.
  const recoveryShown = useRef(false);
  useEffect(() => {
    if (recoveryShown.current) return;
    const suggestion = aiService.getMissedTaskRecoverySuggestions(tasks)[0];
    if (!suggestion) return;
    recoveryShown.current = true;
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-recovery',
        sender: 'assistant',
        content: `Overdue task: "${suggestion.taskTitle}" (${suggestion.originalTime}) is still open. Do you want to move it to tomorrow?`,
        missedRecovery: suggestion,
      },
    ]);
  }, [tasks]);

  const presetPrompts = [
    'I have 3 hours free today. I need to practice Java, apply for two jobs, finish my project API and practice English.',
    'I have an interview tomorrow at 11 AM. Plan a high-intensity preparation schedule for this afternoon.',
    'I feel overwhelmed with 6 tasks today. Prioritize the top 3 high-impact items for me.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isGenerating) return;

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);
    setAcceptedSuccess(false);

    try {
      // 2. Generate schedule proposal via aiService
      const proposal = await aiService.generateDailySchedule(text, tasks);
      setActiveProposal(proposal);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: `Here is a plan for your ${proposal.totalAvailableHours}-hour window. Review the time blocks below:`,
        proposal,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Accepting moves your existing tasks to the proposed times. It never creates duplicate tasks.
  const handleAcceptSchedule = (proposal: AIScheduleProposal) => {
    proposal.scheduledSlots.forEach((slot) => {
      const task = tasks.find((t) => t.id === slot.taskId);
      if (!task) return;
      updateTask({ ...task, dueDate: todayISO(), scheduledTime: slot.slotTime.split(' - ')[0] });
    });
    setAcceptedSuccess(true);
  };

  const handleAcceptMissedRecovery = (recovery: MissedTaskSuggestion) => {
    postponeTask(recovery.taskId, addDaysISO(1));
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Done. "${recovery.taskTitle}" is now due tomorrow.`,
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <DemoNotice title="How this works.">The planner uses simple rules (priority, due date, free time, fixed items). No external AI model is used in this build.</DemoNotice>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Scheduling Copilot
            </h2>
            <Badge variant="purple" size="sm">Powered by DayPilot AI</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Synthesize routines, high-stakes interviews, and available hours into a realistic time-blocked roadmap.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/my-day')}
          icon={<Calendar className="w-3.5 h-3.5" />}
        >
          View My Day
        </Button>
      </div>

      {/* Preset Prompt Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0">Try prompt:</span>
        {presetPrompts.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(preset)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-left shrink-0 transition-colors max-w-sm truncate shadow-2xs"
          >
            &ldquo;{preset}&rdquo;
          </button>
        ))}
      </div>

      {/* Interactive Chat Stream & Schedule Proposals */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
              }`}
            >
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Missed Recovery Box */}
              {msg.missedRecovery && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Proposed Recovery Time: {msg.missedRecovery.proposedDate} at {msg.missedRecovery.proposedTime}
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {msg.missedRecovery.reason}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptMissedRecovery(msg.missedRecovery!)}
                    >
                      Reschedule for Tomorrow
                    </Button>
                  </div>
                </div>
              )}

              {/* Proposed Schedule Block */}
              {msg.proposal && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Proposed Timeline ({msg.proposal.totalAvailableHours} hrs)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Friday, Oct 31
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    &ldquo;{msg.proposal.strategicAdvice}&rdquo;
                  </p>

                  <div className="space-y-2">
                    {msg.proposal.scheduledSlots.map((slot, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {slot.slotTime}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {slot.taskTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {slot.reasoning}
                          </p>
                        </div>
                        <PriorityPill priority={slot.priority} />
                      </div>
                    ))}
                  </div>

                  {msg.proposal.unscheduledItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">Unscheduled / Deferred: </span>
                      {msg.proposal.unscheduledItems.map((u) => u.taskTitle).join(', ')}
                    </div>
                  )}

                  {/* Actions for this proposal */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSendMessage('Please regenerate with a shorter 2-hour window instead.')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptSchedule(msg.proposal!)}
                      icon={<Check className="w-3.5 h-3.5" />}
                    >
                      Accept Schedule & Apply to My Day
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-3 text-xs text-slate-400 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            Analyzing calendar availability, energy curves, and interview deadlines...
          </div>
        )}

        {acceptedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Schedule successfully accepted! All slots have been added to your My Day planner.
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/my-day')}>
              Go to My Day
            </Button>
          </div>
        )}
      </div>

      {/* Input Message Box */}
      <div className="sticky bottom-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex gap-2">
        <textarea
          rows={2}
          placeholder="Describe your goals for today (e.g. 'I have 2.5 hours free this afternoon, need to do Java DSA and apply to 3 jobs')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <Button
          variant="ai"
          size="md"
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isGenerating}
          icon={<Send className="w-4 h-4" />}
          className="self-end"
        >
          Plan
        </Button>
      </div>
    </div>
  );
};
