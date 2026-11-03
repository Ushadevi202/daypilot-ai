import { Task, TaskCategory, Priority } from '../types';
import { todayISO } from '../utils/today';

export interface ParsedNLPTask {
  title: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
  scheduledTime?: string;
  durationMinutes: number;
  confidence: number;
  notes?: string;
}

export interface AIScheduleProposal {
  id: string;
  totalAvailableHours: number;
  scheduledSlots: {
    slotTime: string;
    taskId?: string;
    taskTitle: string;
    category: TaskCategory;
    priority: Priority;
    durationMinutes: number;
    reasoning: string;
    isConflict?: boolean;
    conflictNote?: string;
  }[];
  unscheduledItems: {
    taskTitle: string;
    reason: string;
  }[];
  strategicAdvice: string;
}

export interface MissedTaskSuggestion {
  taskId: string;
  taskTitle: string;
  originalTime: string;
  proposedTime: string;
  proposedDate: string;
  reason: string;
}

export const aiService = {
  /**
   * Parses natural language task description into structured task fields
   * Example: "Tomorrow at 10 AM, practice Java for 90 minutes"
   */
  parseNaturalLanguageTask(prompt: string): ParsedNLPTask {
    const text = prompt.toLowerCase();
    
    // Determine target date
    const today = new Date();
    let targetDate = new Date(today);
    
    if (text.includes('tomorrow')) {
      targetDate.setDate(today.getDate() + 1);
    } else if (text.includes('today')) {
      // today
    } else if (text.includes('next monday')) {
      const day = today.getDay();
      const diff = today.getDate() + ((8 - day) % 7 || 7);
      targetDate.setDate(diff);
    } else if (text.includes('friday')) {
      const day = today.getDay();
      const diff = today.getDate() + ((5 - day + 7) % 7 || 7);
      targetDate.setDate(diff);
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dueDate = `${yyyy}-${mm}-${dd}`;

    // Extract time
    let scheduledTime: string | undefined = undefined;
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i) || text.match(/at\s*(\d{1,2})(?::(\d{2}))?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? timeMatch[2] : '00';
      const modifier = timeMatch[3]?.toLowerCase();
      if (modifier === 'pm' && hours < 12) hours += 12;
      if (modifier === 'am' && hours === 12) hours = 0;
      scheduledTime = `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    // Extract duration
    let durationMinutes = 60; // default 1 hour
    const durationMatch = text.match(/(\d+)\s*(?:mins|minutes|min)/i);
    const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/i);
    if (durationMatch) {
      durationMinutes = parseInt(durationMatch[1], 10);
    } else if (hourMatch) {
      durationMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
    }

    // Determine category
    let category: TaskCategory = 'general';
    if (text.includes('java') || text.includes('code') || text.includes('api') || text.includes('bug') || text.includes('spring') || text.includes('backend')) {
      category = 'development';
    } else if (text.includes('interview') || text.includes('star') || text.includes('system design') || text.includes('mock')) {
      category = 'interview_prep';
    } else if (text.includes('job') || text.includes('resume') || text.includes('apply') || text.includes('recruiter') || text.includes('outreach')) {
      category = 'job_search';
    } else if (text.includes('dsa') || text.includes('leetcode') || text.includes('learn') || text.includes('sql') || text.includes('read')) {
      category = 'learning';
    } else if (text.includes('gym') || text.includes('exercise') || text.includes('run') || text.includes('workout')) {
      category = 'personal';
    }

    // Determine priority
    let priority: Priority = 'medium';
    if (text.includes('urgent') || text.includes('high priority') || text.includes('asap') || text.includes('critical') || text.includes('interview')) {
      priority = 'high';
    } else if (text.includes('low priority') || text.includes('later') || text.includes('chill') || text.includes('someday')) {
      priority = 'low';
    }

    // Clean up title
    let cleanTitle = prompt
      .replace(/tomorrow/gi, '')
      .replace(/today/gi, '')
      .replace(/at\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
      .replace(/for\s*\d+\s*(?:mins|minutes|min|hours|hour|hrs|hr)/gi, '')
      .replace(/high priority|urgent|low priority/gi, '')
      .trim();

    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = prompt;
    } else {
      // capitalize first letter
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    return {
      title: cleanTitle,
      category,
      priority,
      dueDate,
      scheduledTime: scheduledTime || '10:00',
      durationMinutes,
      // Share of the three details (date, time, duration) that the text actually contained
      confidence: Math.round(
        (((/tomorrow|today|next monday|friday/.test(text) ? 1 : 0) + (timeMatch ? 1 : 0) + (durationMatch || hourMatch ? 1 : 0)) / 3) * 100
      ),
      notes: `Extracted via DayPilot AI NLP parser from prompt: "${prompt}"`,
    };
  },

  /**
   * Builds today's plan from the user's real open tasks. No AI model is involved:
   * high priority first, then the oldest due date; fixed items that already have a time today stay where they are.
   */
  async generateDailySchedule(userInput: string, existingTasks: Task[]): Promise<AIScheduleProposal> {
    const today = todayISO();
    const now = new Date();
    const toMin = (hhmm: string) => parseInt(hhmm.slice(0, 2), 10) * 60 + parseInt(hhmm.slice(3, 5), 10);
    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

    const hoursMatch = userInput.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
    const availableMinutes = Math.min(Math.max(Math.round((hoursMatch ? parseFloat(hoursMatch[1]) : 3) * 60), 30), 720);

    let startMin = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
    if (startMin > 21 * 60) startMin = 9 * 60;
    const windowEnd = Math.min(startMin + availableMinutes, 23 * 60 + 45);

    const open = existingTasks.filter((t) => t.status === 'pending');
    const fixed = open.filter((t) => t.dueDate === today && t.scheduledTime);
    const busy = fixed.map((t) => ({ start: toMin(t.scheduledTime!), end: toMin(t.scheduledTime!) + t.durationMinutes }));

    const candidates = open
      .filter((t) => !t.isRoutineInstance && t.dueDate <= today && !(t.dueDate === today && t.scheduledTime))
      .sort((a, b) => rank[a.priority] - rank[b.priority] || a.dueDate.localeCompare(b.dueDate));

    const gap = 10;
    let cursor = startMin;
    const scheduledSlots: AIScheduleProposal['scheduledSlots'] = [];
    const unscheduledItems: AIScheduleProposal['unscheduledItems'] = [];

    for (const task of candidates) {
      let start = cursor;
      let placed = false;
      while (start + task.durationMinutes <= windowEnd) {
        const clash = busy.find((b) => start < b.end && start + task.durationMinutes > b.start);
        if (!clash) {
          placed = true;
          break;
        }
        start = clash.end + gap;
      }
      if (placed) {
        const end = start + task.durationMinutes;
        scheduledSlots.push({
          slotTime: `${fmt(start)} - ${fmt(end)}`,
          taskId: task.id,
          taskTitle: task.title,
          category: task.category,
          priority: task.priority,
          durationMinutes: task.durationMinutes,
          reasoning: `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority, ${
            task.dueDate < today ? `overdue since ${task.dueDate}` : 'due today'
          }. Placed in the first free gap that fits.`,
        });
        busy.push({ start, end });
        cursor = end + gap;
      } else {
        unscheduledItems.push({
          taskTitle: task.title,
          reason: `Does not fit in the ${Math.round(availableMinutes / 6) / 10}-hour window after fixed items.`,
        });
      }
    }

    return {
      id: `prop-${Date.now()}`,
      totalAvailableHours: Math.round(availableMinutes / 6) / 10,
      strategicAdvice: candidates.length === 0
        ? 'You have no unscheduled open tasks for today. Fixed items with a time stay as they are.'
        : `${scheduledSlots.length} of ${candidates.length} open task(s) fit your ${Math.round(availableMinutes / 6) / 10}-hour window. `
          + `Order: highest priority first, then oldest due date. ${fixed.length} fixed item(s) with a time today were kept where they are.`,
      scheduledSlots,
      unscheduledItems,
    };
  },

  /**
   * Overdue open tasks you could move to tomorrow. It states facts only (the task is past its due date);
   * it never guesses why the task was missed.
   */
  getMissedTaskRecoverySuggestions(tasks: Task[]): MissedTaskSuggestion[] {
    const today = todayISO();
    const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter((t) => !t.isRoutineInstance && t.status === 'pending' && t.dueDate < today)
      .sort((a, b) => rank[a.priority] - rank[b.priority] || a.dueDate.localeCompare(b.dueDate))
      .slice(0, 1)
      .map((t) => ({
        taskId: t.id,
        taskTitle: t.title,
        originalTime: `Due ${t.dueDate}${t.scheduledTime ? ` at ${t.scheduledTime}` : ''}`,
        proposedTime: t.scheduledTime || 'a time you choose',
        proposedDate: 'Tomorrow',
        reason: 'This task is past its due date and is still open.',
      }));
  },
};
