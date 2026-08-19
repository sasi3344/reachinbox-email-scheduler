import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEmails } from '../hooks/useEmails';
import { useToast } from '../hooks/useToast';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ActiveTab } from '../components/dashboard/Sidebar';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ScheduledEmailsTable } from '../components/dashboard/ScheduledEmailsTable';
import { SentEmailsTable } from '../components/dashboard/SentEmailsTable';
import { ArchitectureOverview } from '../components/dashboard/ArchitectureOverview';
import { ComposeEmailModal } from '../components/dashboard/ComposeEmailModal';
import { SmtpSettingsModal } from '../components/dashboard/SmtpSettingsModal';
import { ToastContainer } from '../components/common/Toast';
import { Settings } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { scheduledEmails, sentEmails, loading, refreshing, stats, refresh, scheduleCampaign } =
    useEmails(true, 4000); // 4-second polling for smooth real-time updates
  const { toasts, removeToast, success, error } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('scheduled');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSmtpSettingsOpen, setIsSmtpSettingsOpen] = useState(false);

  const handleScheduleSuccess = (count: number) => {
    success('Campaign Scheduled!', `Successfully queued ${count} emails with BullMQ delayed jobs.`);
    refresh();
  };

  const handleScheduleError = (msg: string) => {
    error('Scheduling Error', msg);
  };

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={logout}
      onOpenCompose={() => setIsComposeOpen(true)}
      onRefresh={refresh}
      refreshing={refreshing}
      scheduledCount={stats.totalScheduled + stats.totalProcessing}
      sentCount={stats.totalSent + stats.totalFailed}
    >
      {/* Top Banner with Real SMTP Settings Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 shadow-sm">
        <div className="text-xs text-slate-300 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Email Delivery Mode:{' '}
            <strong className="text-white font-semibold">Ethereal Sandbox (Preview URLs) / Real Gmail SMTP</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsSmtpSettingsOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
        >
          <Settings className="w-3.5 h-3.5 text-brand-400" />
          <span>Configure Real Gmail / SMTP</span>
        </button>
      </div>

      {/* Interactive Top Overview Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Scheduled Queue"
          value={stats.totalScheduled}
          type="scheduled"
          subtext="Click to view scheduled queue"
          isActive={activeTab === 'scheduled'}
          onClick={() => setActiveTab('scheduled')}
        />
        <StatsCard
          title="Processing"
          value={stats.totalProcessing}
          type="processing"
          subtext="Active worker concurrency"
          isActive={activeTab === 'scheduled'}
          onClick={() => setActiveTab('scheduled')}
        />
        <StatsCard
          title="Delivered"
          value={stats.totalSent}
          type="sent"
          subtext="Click to view sent outbox & preview URLs"
          isActive={activeTab === 'sent'}
          onClick={() => setActiveTab('sent')}
        />
        <StatsCard
          title="Failed / Dropped"
          value={stats.totalFailed}
          type="failed"
          subtext="Click to view failed delivery"
          isActive={activeTab === 'sent'}
          onClick={() => setActiveTab('sent')}
        />
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'scheduled' && (
          <ScheduledEmailsTable emails={scheduledEmails} loading={loading} />
        )}

        {activeTab === 'sent' && <SentEmailsTable emails={sentEmails} loading={loading} />}

        {activeTab === 'analytics' && <ArchitectureOverview />}
      </div>

      {/* Compose Campaign Modal */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSchedule={scheduleCampaign}
        onSuccess={handleScheduleSuccess}
        onError={handleScheduleError}
      />

      {/* Real SMTP Settings Modal */}
      <SmtpSettingsModal
        isOpen={isSmtpSettingsOpen}
        onClose={() => setIsSmtpSettingsOpen(false)}
        onSuccess={(msg) => success('SMTP Configured', msg)}
        onError={(msg) => error('SMTP Error', msg)}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </DashboardLayout>
  );
};
