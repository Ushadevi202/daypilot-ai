import { todayISO } from '../../utils/today';
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  Repeat,
  CalendarDays,
  Briefcase,
  Mail,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';

export const Sidebar: React.FC<{ isOpenMobile: boolean; onCloseMobile: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { emailAlerts, tasks, applications, openQuickAdd, user, logout } = useApp();

  // Badges calculation
  const pendingEmailsCount = emailAlerts.filter((e) => e.reviewStatus === 'pending').length;
  const overdueTasksCount = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayISO()).length;
  const activeInterviewsCount = applications.filter((a) => a.currentStatus === 'interview').length;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/my-day',
      label: 'My Day',
      icon: SunMedium,
      badge: overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    },
    {
      to: '/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      count: tasks.filter((t) => t.status !== 'completed').length,
    },
    {
      to: '/routines',
      label: 'Routines',
      icon: Repeat,
    },
    {
      to: '/calendar',
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      to: '/applications',
      label: 'Job Applications',
      icon: Briefcase,
      badge: activeInterviewsCount > 0 ? `${activeInterviewsCount} loops` : undefined,
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    },
    {
      to: '/email-assistant',
      label: 'Email Assistant',
      icon: Mail,
      badge: pendingEmailsCount > 0 ? `${pendingEmailsCount} new` : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    },
    {
      to: '/ai-planner',
      label: 'AI Planner',
      icon: Sparkles,
      isSpecial: true,
    },
    {
      to: '/insights',
      label: 'Insights & Reviews',
      icon: BarChart3,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  DayPilot <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 truncate">Career & Routine OS</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Global Quick Action Button in Sidebar */}
        <div className="p-3">
          <button
            onClick={() => openQuickAdd('task')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Create Task, Routine or Application"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Quick Add</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : item.isSpecial
                      ? 'text-purple-500 group-hover:text-purple-600'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && !item.badge && (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Profile Footer & Quick Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-1">
            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              className={`flex-1 flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size="sm"
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {user.targetRole.split('&')[0]}
                  </span>
                </div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Log Out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
