import { todayISO } from '../utils/today';
import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  MoreVertical,
  X,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ApplicationStatusPill } from '../components/common/StatusPill';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { JobApplication, ApplicationStatus, ApplicationTimelineEvent } from '../types';

export const Applications: React.FC = () => {
  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
    addTimelineEvent,
    emailAlerts,
    openQuickAdd,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'interviews' | 'assessments'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selected Application for Detail Drawer/Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // Status Change Dialog
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ app: JobApplication; newStatus: ApplicationStatus } | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');

  // Add Manual Timeline Event State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(todayISO());
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState<ApplicationTimelineEvent['type']>('interview');

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (search.trim()) {
      const matchCompany = app.companyName.toLowerCase().includes(search.toLowerCase());
      const matchRole = app.jobTitle.toLowerCase().includes(search.toLowerCase());
      if (!matchCompany && !matchRole) return false;
    }
    if (statusFilter !== 'all' && app.currentStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  // Kanban Columns
  const kanbanColumns: { id: ApplicationStatus; label: string; countColor: string }[] = [
    { id: 'interested', label: 'Bookmarked', countColor: 'text-slate-500' },
    { id: 'applied', label: 'Applied', countColor: 'text-blue-500' },
    { id: 'assessment', label: 'Assessment', countColor: 'text-amber-500' },
    { id: 'interview', label: 'Interviewing', countColor: 'text-purple-500' },
    { id: 'selected', label: 'Offer Extended', countColor: 'text-emerald-500' },
    { id: 'rejected', label: 'Archived / Rejected', countColor: 'text-rose-500' },
  ];

  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget) return;
    updateApplicationStatus(
      statusChangeTarget.app.id,
      statusChangeTarget.newStatus,
      statusChangeNote || `Transitioned to ${statusChangeTarget.newStatus}`
    );
    // Refresh selectedApp if open
    if (selectedApp?.id === statusChangeTarget.app.id) {
      setSelectedApp({
        ...statusChangeTarget.app,
        currentStatus: statusChangeTarget.newStatus,
      });
    }
    setStatusChangeTarget(null);
    setStatusChangeNote('');
  };

  const handleAddManualEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newEventTitle.trim()) return;

    addTimelineEvent(selectedApp.id, {
      title: newEventTitle.trim(),
      date: newEventDate,
      description: newEventDesc.trim() || undefined,
      type: newEventType,
    });

    // Refresh selectedApp
    const updated = applications.find((a) => a.id === selectedApp.id);
    if (updated) setSelectedApp(updated);

    setIsAddEventOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Job Application Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track interview loops, assessments, recruiter contacts, and full round-by-round history.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => openQuickAdd('application')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Job Application
        </Button>
      </div>

      {/* Control Bar: Views + Search + Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('interviews')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'interviews'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Active Interviews ({applications.filter((a) => a.currentStatus === 'interview').length})
          </button>
          <button
            onClick={() => setViewMode('assessments')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              viewMode === 'assessments'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Assessments ({applications.filter((a) => a.currentStatus === 'assessment').length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="interview">Interviewing</option>
            <option value="assessment">Assessment</option>
            <option value="applied">Applied</option>
            <option value="selected">Offer Extended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1100px] grid grid-cols-6 gap-4">
            {kanbanColumns.map((col) => {
              const colApps = filteredApps.filter((a) => a.currentStatus === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800/80 flex flex-col min-h-[550px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {col.label}
                    </span>
                    <span className={`text-xs font-extrabold ${col.countColor}`}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {app.companyName}
                          </h4>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {app.locationType}
                          </span>
                        </div>

                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
                          {app.jobTitle}
                        </p>

                        {app.nextAction && (
                          <div className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 p-1.5 rounded font-medium line-clamp-2">
                            ⚡ {app.nextAction}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{app.source}</span>
                          <span>{app.timeline.length} updates</span>
                        </div>
                      </div>
                    ))}

                    {colApps.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 italic">
                        Empty stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Applied Date</th>
                  <th className="px-4 py-3.5">Next Action</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Rounds</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {app.companyName}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {app.jobTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ApplicationStatusPill status={app.currentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {app.applicationDate}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {app.nextAction || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 capitalize">
                      {app.locationType} • {app.location}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {app.interviewsCount} interviews
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Timeline →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE INTERVIEWS */}
      {viewMode === 'interviews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter((a) => a.currentStatus === 'interview')
              .map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-xs hover:border-purple-400 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Active Loop ({app.interviewsCount} completed)
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.jobTitle}</p>
                    </div>
                    <ApplicationStatusPill status="interview" />
                  </div>

                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl text-xs text-purple-900 dark:text-purple-200">
                    <strong>Next Action:</strong> {app.nextAction}
                  </div>

                  {app.recruiterName && (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Recruiter: {app.recruiterName} ({app.recruiterEmail})
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={() => setSelectedApp(app)}>
                      View Round History & Prep
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 4: ASSESSMENTS */}
      {viewMode === 'assessments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter((a) => a.currentStatus === 'assessment')
              .map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Technical Assessment Pending
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.jobTitle}</p>
                    </div>
                    <ApplicationStatusPill status="assessment" />
                  </div>

                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <strong>Instructions:</strong> {app.nextAction}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={() => setSelectedApp(app)}>
                      Review Assessment Timeline
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* APPLICATION DETAIL MODAL / DRAWER */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.companyName} — ${selectedApp.jobTitle}` : ''}
        description={selectedApp ? `Applied on ${selectedApp.applicationDate} via ${selectedApp.source}` : ''}
        maxWidth="2xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Quick Status Bar & Pipeline Transition Dropdown */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Current Pipeline Stage:</span>
                <ApplicationStatusPill status={selectedApp.currentStatus} />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedApp.currentStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as ApplicationStatus;
                    setStatusChangeTarget({ app: selectedApp, newStatus });
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="interested">Move to: Interested</option>
                  <option value="applied">Move to: Applied</option>
                  <option value="assessment">Move to: Assessment</option>
                  <option value="interview">Move to: Interviewing</option>
                  <option value="selected">Move to: Selected / Offer</option>
                  <option value="rejected">Move to: Rejected</option>
                  <option value="withdrawn">Move to: Withdrawn</option>
                  <option value="on_hold">Move to: On Hold</option>
                </select>
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {selectedApp.locationType} ({selectedApp.location})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
                <span className="text-slate-400 block">Compensation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedApp.salaryRange || 'Competitive'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
                <span className="text-slate-400 block">Resume Used</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedApp.resumeVersion}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40">
                <span className="text-slate-400 block">Recruiter</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedApp.recruiterName || 'General Portal'}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            {selectedApp.notes && (
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Role Notes & Talking Points
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 leading-relaxed">
                  {selectedApp.notes}
                </p>
              </div>
            )}

            {/* Application Timeline Section (Round-by-Round History) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Application Timeline & Round History
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddEventOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Log Round / Note
                </Button>
              </div>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {selectedApp.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {event.title}
                        </span>
                        <span className="text-[11px] text-slate-400">{event.date}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Emails from AI Assistant */}
            {emailAlerts.filter((e) => e.matchedApplicationId === selectedApp.id).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-500" />
                  Linked Inbound Messages ({emailAlerts.filter((e) => e.matchedApplicationId === selectedApp.id).length})
                </h4>
                <div className="space-y-2">
                  {emailAlerts
                    .filter((e) => e.matchedApplicationId === selectedApp.id)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 text-xs"
                      >
                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{msg.subject}</span>
                          <span className="text-[10px] text-slate-400">{msg.receivedDate}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Delete Record button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setAppToDelete(selectedApp.id)}
              >
                Delete Application Record
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Timeline Event Modal */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Log Round or Status Event"
        description={`Record interview round or assessment for ${selectedApp?.companyName}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddManualEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Round 2 System Design with Principal Architect"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Type
              </label>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="interview">Interview Round</option>
                <option value="assessment">Online Assessment</option>
                <option value="acknowledgment">Acknowledgment</option>
                <option value="offer">Offer Extended</option>
                <option value="rejection">Rejection</option>
                <option value="note">General Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Feedback / Details / Interviewer notes
            </label>
            <textarea
              rows={3}
              placeholder="Add key notes, questions asked, or follow-up feedback..."
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Timeline Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Pipeline Status Change Dialog */}
      <Modal
        isOpen={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        title="Confirm Status Change"
        maxWidth="sm"
      >
        {statusChangeTarget && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to update <strong>{statusChangeTarget.app.companyName}</strong> to{' '}
              <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">
                {statusChangeTarget.newStatus}
              </span>
              ? This will be preserved on your timeline.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Received email invitation from recruiter"
                value={statusChangeNote}
                onChange={(e) => setStatusChangeNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStatusChangeTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmStatusChange}>
                Confirm Transition
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Application Confirmation */}
      <ConfirmDialog
        isOpen={!!appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={() => {
          if (appToDelete) {
            deleteApplication(appToDelete);
            setSelectedApp(null);
            setAppToDelete(null);
          }
        }}
        title="Delete Job Application"
        message="Are you sure you want to delete this application record? All timeline events and links will be permanently removed."
      />
    </div>
  );
};
