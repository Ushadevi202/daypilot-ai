import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalQuickAddModal } from './components/layout/GlobalQuickAddModal';
import { RealtimeNotificationToast } from './components/common/RealtimeNotificationToast';
import { BackendBanner } from './components/common/BackendBanner';

// Pages
import { Dashboard } from './pages/Dashboard';
import { MyDay } from './pages/MyDay';
import { Tasks } from './pages/Tasks';
import { Routines } from './pages/Routines';
import { CalendarView } from './pages/Calendar';
import { Applications } from './pages/Applications';
import { EmailAssistant } from './pages/EmailAssistant';
import { AIPlanner } from './pages/AIPlanner';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useApp } from './context/AppContext';

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Real-time Notification Toast Alert System */}
      <RealtimeNotificationToast />

      {/* Sidebar (Desktop Collapsible & Mobile Drawer) */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Persistent Top Navigation Bar */}
        <TopBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <BackendBanner />

        {/* Dynamic Page Routes */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/my-day" element={<MyDay />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/email-assistant" element={<EmailAssistant />} />
            <Route path="/ai-planner" element={<AIPlanner />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Quick Action Modal */}
      <GlobalQuickAddModal />
    </div>
  );
};

const RootNavigator: React.FC = () => {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
        Loading DayPilot...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RootNavigator />
      </BrowserRouter>
    </AppProvider>
  );
}
