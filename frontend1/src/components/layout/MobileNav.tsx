import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  Briefcase,
  Mail,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { openQuickAdd, emailAlerts } = useApp();
  const unreadEmails = emailAlerts.filter((e) => e.reviewStatus === 'pending').length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/my-day"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <SunMedium className="w-5 h-5" />
        <span>My Day</span>
      </NavLink>

      {/* Floating Center Action */}
      <button
        onClick={() => openQuickAdd('task')}
        className="w-10 h-10 -mt-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
        aria-label="Quick Add"
      >
        <Plus className="w-5 h-5" />
      </button>

      <NavLink
        to="/applications"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Briefcase className="w-5 h-5" />
        <span>Jobs</span>
      </NavLink>

      <NavLink
        to="/email-assistant"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Mail className="w-5 h-5" />
        <span>Emails</span>
        {unreadEmails > 0 && (
          <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
        )}
      </NavLink>
    </div>
  );
};
