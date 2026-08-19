import React from 'react';
import { Email } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { formatDateTime, formatRelativeTime } from '../../utils/date-formatter';
import { ExternalLink, Mail, CheckCircle2 } from 'lucide-react';

interface SentEmailsTableProps {
  emails: Email[];
  loading: boolean;
}

export const SentEmailsTable: React.FC<SentEmailsTableProps> = ({ emails, loading }) => {
  const columns: Column<Email>[] = [
    {
      header: 'Recipient',
      accessorKey: 'recipient',
      cell: (email) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="font-medium text-white block">{email.recipient}</span>
            <span className="text-[11px] text-slate-500 font-mono">ID: {email.id.slice(0, 8)}...</span>
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
          {email.errorMessage && (
            <p className="text-[11px] text-rose-400 truncate mt-0.5" title={email.errorMessage}>
              Error: {email.errorMessage}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Sent At',
      accessorKey: 'sentAt',
      cell: (email) => (
        <div>
          <span className="text-slate-200 block text-xs">{formatDateTime(email.sentAt || email.updatedAt)}</span>
          <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{formatRelativeTime(email.sentAt || email.updatedAt)}</span>
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
      header: 'Ethereal Preview',
      cell: (email) =>
        email.previewUrl ? (
          <a
            href={email.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 border border-brand-500/30 transition-colors"
          >
            <span>View Email</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Sent & Delivery Outbox</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Successfully delivered emails via Ethereal SMTP with inspectable web preview links
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={emails}
        loading={loading}
        emptyTitle="No sent emails yet"
        emptyDescription="When scheduled jobs mature and workers dispatch emails via Ethereal SMTP, they will appear here."
        keyExtractor={(item) => item.id}
      />
    </div>
  );
};
