import React, { useState, useEffect } from 'react';
import { Mail, Clock, ShieldCheck, X, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { realtimeService } from '../../services/realtimeService';

export interface LiveToastItem {
  id: string;
  type: 'inbound_email' | 'task_overdue' | 'security_login';
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  timestamp: string;
}

export const RealtimeNotificationToast: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<LiveToastItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to real-time events from realtimeService
    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.type === 'EMAIL_ALERT_DETECTED') {
        const email = event.data;
        const newToast: LiveToastItem = {
          id: `toast-${Date.now()}`,
          type: 'inbound_email',
          title: `Inbound Email: ${email.companyDetected || 'Applied Company'}`,
          message: email.subject || 'New update regarding your job application',
          actionText: 'Review Email Alert',
          actionRoute: '/email-assistant',
          timestamp: 'Just now',
        };
        setActiveToasts((prev) => [newToast, ...prev.slice(0, 2)]);
      } else if (event.type === 'AUTH_LOGIN') {
        const newToast: LiveToastItem = {
          id: `toast-${Date.now()}`,
          type: 'security_login',
          title: 'Security Alert: Sign-In Verified',
          message: `Authenticated as ${event.entityId}. Real-time session active.`,
          timestamp: 'Just now',
        };
        setActiveToasts((prev) => [newToast, ...prev.slice(0, 2)]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-200 flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            {toast.type === 'inbound_email' && <Mail className="w-4 h-4 text-amber-500" />}
            {toast.type === 'task_overdue' && <Clock className="w-4 h-4 text-rose-500" />}
            {toast.type === 'security_login' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {toast.title}
              </span>
              <button
                onClick={() => handleDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
              {toast.message}
            </p>

            {toast.actionText && toast.actionRoute && (
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  onClick={() => {
                    navigate(toast.actionRoute!);
                    handleDismiss(toast.id);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{toast.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
