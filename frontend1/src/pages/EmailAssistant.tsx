import { DemoNotice } from '../components/common/DemoNotice';
import React, { useState } from 'react';
import {
  Mail,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Link as LinkIcon,
  Check,
  Eye,
  Sliders,
  X,
  Unlink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmailAlert } from '../types';

export const EmailAssistant: React.FC = () => {
  const {
    emailAlerts,
    applications,
    approveEmailAlert,
    rejectEmailAlert,
    dismissEmailAlert,
    matchEmailToApplication,
    triggerInboundEmailSimulation,
    isEmailLinked,
    linkedEmailAccount,
    linkEmailAccount,
    unlinkEmailAccount,
    user,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailAlert | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 minutes ago');
  const [unmatchedEmailToPair, setUnmatchedEmailToPair] = useState<EmailAlert | null>(null);
  const [targetPairAppId, setTargetPairAppId] = useState('');

  // Email linking modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'Google' | 'Outlook'>('Google');
  const [customEmailInput, setCustomEmailInput] = useState(user.email || 'alex.turner@gmail.com');
  const [isLinking, setIsLinking] = useState(false);

  // Count unreviewed
  const unreviewedCount = emailAlerts.filter((e) => e.reviewStatus === 'pending').length;

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'interview_invite', label: 'Interview Invites' },
    { id: 'assessment_invite', label: 'Assessments' },
    { id: 'selection_offer', label: 'Offers / Selection' },
    { id: 'acknowledgment', label: 'Acknowledgments' },
    { id: 'rejection', label: 'Rejections' },
    { id: 'unmatched', label: 'Unmatched / Review' },
  ];

  const filteredEmails = emailAlerts.filter((email) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unmatched') {
      return email.category === 'unmatched' || !email.matchedApplicationId;
    }
    return email.category === activeCategory;
  });

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
    }, 1200);
  };

  const handlePairApplication = () => {
    if (!unmatchedEmailToPair || !targetPairAppId) return;
    matchEmailToApplication(unmatchedEmailToPair.id, targetPairAppId);
    setUnmatchedEmailToPair(null);
    setTargetPairAppId('');
  };

  const handleConfirmEmailLink = async () => {
    setIsLinking(true);
    await new Promise((r) => setTimeout(r, 800));
    await linkEmailAccount(customEmailInput, selectedProvider);
    setIsLinking(false);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <DemoNotice>Gmail is not connected in this build. The emails below are sample data that show how the review workflow will work. Nothing is read from your inbox.</DemoNotice>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              AI Email Monitoring Center
            </h2>
            <Badge variant="purple" size="sm">Signature Feature</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detects interview invitations, coding assessments, and job offers directly from your inbox with explainable AI.
          </p>
        </div>

        {isEmailLinked && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              isLoading={isSyncing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              Sync Inbound Mail
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={triggerInboundEmailSimulation}
              icon={<Mail className="w-3.5 h-3.5" />}
            >
              Simulate Inbound Company Email
            </Button>
          </div>
        )}
      </div>

      {/* EMAIL LINKING / AUTH GATE: Shown if user has not yet authorized email */}
      {!isEmailLinked ? (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-800/50">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-600/40 text-xs font-semibold text-indigo-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Authorization Required for Email Tracking</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Link Your Email to Start Tracking Job Applications
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              DayPilot AI connects to your inbox via secure OAuth 2.0 to scan for company application receipts, technical interview invitations, and coding challenges in real time. We never read personal emails or send messages on your behalf.
            </p>

            {/* Privacy & Security Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Read-Only Access
                </div>
                <p className="text-[11px] text-slate-300">
                  Only analyzes messages from recognized employer hiring domains.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  AI Interview Extraction
                </div>
                <p className="text-[11px] text-slate-300">
                  Parses dates, meeting links, and HackerRank / CodeSignal links into your schedule.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Lock className="w-4 h-4" />
                  OAuth 2.0 Protected
                </div>
                <p className="text-[11px] text-slate-300">
                  Credentials are encrypted with bank-level security; disconnect anytime.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedProvider('Google');
                  setIsAuthModalOpen(true);
                }}
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                }
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
              >
                Connect Google / Gmail
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSelectedProvider('Outlook');
                  setIsAuthModalOpen(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Connect Microsoft Outlook
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Status Banner when Linked */
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Connected to {linkedEmailAccount?.email || user.email}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active Monitoring ({linkedEmailAccount?.provider || 'Google OAuth'})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scanning incoming messages every 15 minutes. Automatically flags high-priority interview rounds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="text-slate-400">Last polled: {lastSyncTime}</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{unreviewedCount} unreviewed</span>
            <button
              onClick={unlinkEmailAccount}
              className="ml-2 text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-semibold flex items-center gap-1"
              title="Revoke email permissions"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Pills (Always active or visible) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Email Alert Cards List */}
      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No alerts in this category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {!isEmailLinked
                ? 'Link your email account above to begin tracking incoming recruiter responses.'
                : 'Try simulating an inbound company email or check back after the next polling cycle.'}
            </p>
            {isEmailLinked && (
              <Button
                variant="primary"
                size="sm"
                onClick={triggerInboundEmailSimulation}
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                Simulate Inbound Company Email
              </Button>
            )}
          </div>
        ) : (
          filteredEmails.map((alert) => {
            const isApproved = alert.reviewStatus === 'approved';
            const isRejected = alert.reviewStatus === 'rejected';
            const isDismissed = alert.reviewStatus === 'dismissed';

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                  alert.reviewStatus === 'pending'
                    ? 'border-indigo-200 dark:border-indigo-900/60 shadow-xs ring-1 ring-indigo-500/10'
                    : 'border-slate-200/80 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Email Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {alert.companyDetected}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {alert.senderName} ({alert.senderEmail})
                      </span>
                      <Badge
                        variant={
                          alert.category === 'interview_invite'
                            ? 'purple'
                            : alert.category === 'assessment_invite'
                            ? 'warning'
                            : alert.category === 'selection_offer'
                            ? 'success'
                            : alert.category === 'rejection'
                            ? 'danger'
                            : 'default'
                        }
                        size="sm"
                      >
                        {alert.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="purple" size="sm">
                        {alert.aiConfidence}% AI match
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {alert.subject}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {alert.snippet}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.receivedDate}
                      </span>
                      {alert.matchedApplicationId ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Matched to active application
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Unmatched application
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Suggested AI Action & Buttons */}
                  <div className="lg:w-80 shrink-0 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                        Explainable Action
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {alert.suggestedAction.description}
                      </p>
                    </div>

                    {alert.reviewStatus === 'pending' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => approveEmailAlert(alert.id)}
                          className="flex-1 text-xs"
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Approve Action
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectEmailAlert(alert.id)}
                          className="text-xs"
                          title="Reject suggested change"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedEmail(alert)}
                          className="text-xs"
                          title="Read full email"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span
                          className={
                            isApproved
                              ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1'
                              : isRejected
                              ? 'text-rose-500 flex items-center gap-1'
                              : 'text-slate-400'
                          }
                        >
                          {isApproved && <CheckCircle2 className="w-4 h-4" />}
                          {isRejected && <XCircle className="w-4 h-4" />}
                          {isApproved ? 'Action Applied' : isRejected ? 'Rejected' : 'Dismissed'}
                        </span>
                        <button
                          onClick={() => setSelectedEmail(alert)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Email Viewer Modal */}
      <Modal
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
        title={selectedEmail ? `${selectedEmail.companyDetected} Email` : 'Email View'}
        maxWidth="lg"
      >
        {selectedEmail && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5 border border-slate-100 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">From:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedEmail.senderName} &lt;{selectedEmail.senderEmail}&gt;
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedEmail.subject}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Received:</span>
                <span className="text-slate-600 dark:text-slate-300">{selectedEmail.receivedDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {selectedEmail.body}
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                AI Recommendation:
              </span>
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                {selectedEmail.suggestedAction.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEmail(null)}>
                Close
              </Button>
              {selectedEmail.reviewStatus === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    approveEmailAlert(selectedEmail.id);
                    setSelectedEmail(null);
                  }}
                >
                  Approve Suggested Action
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Google / Outlook OAuth Authorization Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={`Authorize ${selectedProvider} Inbox Access`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 text-xs">
            <Lock className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p>
              DayPilot AI will request read-only permissions to scan job notifications. Your credentials are never stored in plain text.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                value={customEmailInput}
                onChange={(e) => setCustomEmailInput(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Scope of Permissions:
              </span>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Read emails matching recruiter filters (Greenhouse, Lever, Workday)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Extract interview schedules and HackerRank assessment deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Push instant notification to your DayPilot dashboard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAuthModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmEmailLink}
              isLoading={isLinking}
            >
              Grant Authorization & Start Tracking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
