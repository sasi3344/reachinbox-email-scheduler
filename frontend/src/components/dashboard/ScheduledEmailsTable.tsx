import React from 'react';
import { Email } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { formatDateTime, formatRelativeTime } from '../../utils/date-formatter';
import { Mail, Clock } from 'lucide-react';

interface ScheduledEmailsTableProps {
  emails: Email[];
  loading: boolean;
}

export const ScheduledEmailsTable: React.FC<ScheduledEmailsTableProps> = ({ emails, loading }) => {
  const columns: Column<Email>[] = [
    {
      header: 'Recipient',
      accessorKey: 'recipient',
      cell: (email) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Mail className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div>
            <span className="font-medium text-white block">{email.recipient}</span>
            <span className="text-[11px] text-slate-500 font-mono">Job: {email.jobId || 'Queued'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      cell: (email) => (
        <div className="max-w-xs truncate text-slate-200">
          <span className="font-medium">{email.subject}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled For',
      accessorKey: 'scheduledAt',
      cell: (email) => (
        <div>
          <span className="text-slate-200 block text-xs">{formatDateTime(email.scheduledAt)}</span>
          <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatRelativeTime(email.scheduledAt)}</span>
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (email) => <Badge status={email.status} size="sm" />,
    },
    {
      header: 'Attempts',
      accessorKey: 'attempts',
      cell: (email) => (
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {email.attempts}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Scheduled & Processing Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jobs waiting in Redis for worker delayed execution or currently being processed
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={emails}
        loading={loading}
        emptyTitle="No scheduled emails in queue"
        emptyDescription="All delayed email jobs have completed or no campaigns have been scheduled yet."
        keyExtractor={(item) => item.id}
      />
    </div>
  );
};
