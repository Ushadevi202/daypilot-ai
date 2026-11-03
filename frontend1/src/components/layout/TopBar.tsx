import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Briefcase,
  X,
  LogOut,
  LogIn,
  ChevronDown,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

export const TopBar: React.FC<{ onOpenMobileMenu: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    user,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
    tasks,
    applications,
    isAuthenticated,
    authToken,
    authProvider,
    logout,
  } = useApp();

  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search filter results
  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
    : [];
  const filteredApps = searchQuery.trim()
    ? applications.filter(
        (a) =>
          a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults = searchQuery.trim().length > 0;

  // Close notifications and user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}</span>
            </h1>
            <span className="hidden md:inline-block text-xs text-slate-400 font-medium">
              • Friday, Oct 31
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6 relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, companies, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Quick Popover */}
        {isSearchFocused && hasSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 space-y-3">
            {filteredTasks.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Matching Tasks
                </span>
                <div className="mt-1 space-y-1">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate('/tasks')}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredApps.length > 0 && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Job Applications
                </span>
                <div className="mt-1 space-y-1">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => navigate('/applications')}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {app.companyName} — {app.jobTitle}
                      </span>
                      <span className="text-[10px] capitalize text-indigo-500 font-medium">
                        {app.currentStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTasks.length === 0 && filteredApps.length === 0 && (
              <p className="text-xs text-slate-400 p-2 text-center">
                No matching tasks or applications found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right Actions: Notifications, Theme toggle, User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 my-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors flex gap-3 ${
                        notif.read
                          ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-fit shrink-0">
                        {notif.type === 'interview' && <Briefcase className="w-3.5 h-3.5 text-purple-500" />}
                        {notif.type === 'assessment' && <Calendar className="w-3.5 h-3.5 text-amber-500" />}
                        {notif.type === 'email_alert' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                        {notif.type === 'task_due' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {notif.type === 'overdue' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                        {!['interview', 'assessment', 'email_alert', 'task_due', 'overdue'].includes(notif.type) && (
                          <Bell className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* User Profile / Clean Session Menu */}
        {isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="User account menu"
            >
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size="sm"
                showOnlineDot={true}
              />
              <span className="hidden xl:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 pt-1 text-xs">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/login')}
            icon={<LogIn className="w-3.5 h-3.5" />}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
