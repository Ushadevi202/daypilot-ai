import { DemoNotice } from '../components/common/DemoNotice';
import React, { useState, useRef } from 'react';
import {
  User,
  Moon,
  Sun,
  Bell,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  Check,
  Save,
  LogOut,
  Sliders,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { ResumeFile } from '../types';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const {
    user,
    updateUserProfile,
    resumes,
    uploadResume,
    deleteResume,
    setActiveResume,
    theme,
    toggleTheme,
    resetToSampleData,
    logout,
  } = useApp();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean 3 Tabs: 'profile' (Edit Profile), 'resumes' (Upload Resumes), 'settings' (Settings & Preferences)
  // User explicitly instructed: "remove external integration, spring boot backend, security access make them un seeable"
  const [activeTab, setActiveTab] = useState<'profile' | 'resumes' | 'settings'>('profile');

  // Edit Profile Form State
  const [firstName, setFirstName] = useState(user.firstName || user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.lastName || user.name.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+1 (555) 234-5678');
  const [role, setRole] = useState(user.targetRole);
  const [location, setLocation] = useState(user.location || 'New York, NY');
  const [timezone, setTimezone] = useState(user.timezone || 'America/New_York (EST)');
  const [bio, setBio] = useState(
    user.bio || 'Senior Software Engineer specializing in scalable distributed microservices and modern web applications.'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Resume Upload State
  const [resumeNotesInput, setResumeNotesInput] = useState('');
  const [selectedResumeForPreview, setSelectedResumeForPreview] = useState<ResumeFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings / Preferences State
  const [taskReminders, setTaskReminders] = useState(true);
  const [emailAlertNotifications, setEmailAlertNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [dailyEveningReview, setDailyEveningReview] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || user.name,
      email,
      phone,
      targetRole: role,
      location,
      timezone,
      bio,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadResume({
      name: file.name,
      sizeBytes: file.size,
      fileType: file.type || 'application/pdf',
      notes: resumeNotesInput || `Uploaded on ${new Date().toLocaleDateString()}`,
    });

    setResumeNotesInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <DemoNotice>The Google and email connection controls on this page are demonstrations only. Your account, tasks, routines and job applications are real and stored in MySQL.</DemoNotice>
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Profile & Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, career resumes, notification preferences, and application defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Edit Profile</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('resumes')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resumes'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Resume & Documents</span>
            </div>
            {resumes.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {resumes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4" />
              <span>Settings & Preferences</span>
            </div>
          </button>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Personal & Career Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your identity details appear in job application notes, interview trackers, and email assistant matching.
                </p>
              </div>

              {/* Profile Avatar Card with Letter Badge Fallback */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="lg"
                  showOnlineDot={true}
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.targetRole}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Profile badge automatically generates from your initial letters when no photo is provided.
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alex"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Turner"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Role / Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New York, NY (Remote)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Professional Bio & Target Stack
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief background about your experience, preferred technologies, and career focus..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isSaved ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Profile details saved successfully!
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Changes update immediately across the platform.
                    </span>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: RESUME & DOCUMENTS */}
          {activeTab === 'resumes' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Resume & Document Repository
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload multiple resume versions to attach to your job applications and tailor for specific company roles.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    uploadResume({
                      name: file.name,
                      sizeBytes: file.size,
                      fileType: file.type || 'application/pdf',
                      notes: resumeNotesInput || 'Uploaded via drag and drop',
                    });
                  }
                }}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Upload your Resume or CV
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Drag and drop your file here, or click to browse. Supports PDF, DOC, and DOCX up to 10MB.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={resumeNotesInput}
                    onChange={(e) => setResumeNotesInput(e.target.value)}
                    placeholder="Optional note: e.g. Full-Stack / Backend focus"
                    className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    icon={<UploadCloud className="w-3.5 h-3.5" />}
                  >
                    Select File
                  </Button>
                </div>
              </div>

              {/* Uploaded Resumes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Resumes ({resumes.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Select a resume to mark it as active for fast application autofill
                  </span>
                </div>

                {resumes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    No resumes uploaded yet. Upload a PDF resume above to start applying.
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        resume.isActive
                          ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                              {resume.name}
                            </span>
                            {resume.isActive && (
                              <Badge variant="success" size="sm">
                                Primary Active Resume
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>{formatFileSize(resume.sizeBytes)}</span>
                            <span>•</span>
                            <span>Uploaded {resume.uploadedAt}</span>
                          </div>
                          {resume.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Note: {resume.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!resume.isActive && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveResume(resume.id)}
                            className="text-xs"
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResumeForPreview(resume)}
                          className="text-xs"
                          title="Preview details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & PREFERENCES */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Settings & Preferences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your theme, notification triggers, and day planning reminders.
                </p>
              </div>

              {/* Theme Settings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Theme Appearance
                </h4>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <div
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-xs">Light Mode</span>
                    </div>
                    {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>

                  <div
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs">Dark Mode</span>
                    </div>
                    {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alert Notifications
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Real-time Inbound Email Alerts
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Receive instant alerts when recruiters send interview links or test invites.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlertNotifications}
                      onChange={(e) => setEmailAlertNotifications(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Overdue Task Planning Prompts
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Asks &quot;What do you plan about this task?&quot; (Postpone, Not Today, Change Time).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={taskReminders}
                      onChange={(e) => setTaskReminders(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Interview & Assessment Reminders
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Alert 30 minutes before any technical rounds or assessment deadlines.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={interviewReminders}
                      onChange={(e) => setInterviewReminders(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Data & Account Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToSampleData}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Reload data from server
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  icon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Log Out of Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Preview Modal */}
      <Modal
        isOpen={!!selectedResumeForPreview}
        onClose={() => setSelectedResumeForPreview(null)}
        title="Resume Document Details"
        maxWidth="md"
      >
        {selectedResumeForPreview && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 border border-slate-100 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">File Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedResumeForPreview.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Size:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatFileSize(selectedResumeForPreview.sizeBytes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uploaded Date:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedResumeForPreview.uploadedAt}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedResumeForPreview.isActive ? 'Active Primary Resume' : 'Secondary Resume'}
                </span>
              </div>
            </div>

            {selectedResumeForPreview.notes && (
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold block mb-1">Target Role Note:</span>
                {selectedResumeForPreview.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResumeForPreview(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveResume(selectedResumeForPreview.id);
                  setSelectedResumeForPreview(null);
                }}
              >
                Set as Active Resume
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
