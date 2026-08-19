import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatLocalInputDefault } from '../../utils/date-formatter';
import { ScheduleEmailPayload } from '../../types';
import { Clock, Send, Gauge, Timer, FileText, CheckCircle2, User } from 'lucide-react';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: ScheduleEmailPayload) => Promise<any>;
  onSuccess: (count: number) => void;
  onError: (msg: string) => void;
}

/**
 * Universal extractor: turns any file text into a clean list of email addresses
 */
function parseRawEmails(text: string): string[] {
  if (!text || !text.trim()) return [];

  const rawLines = text
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .split(/[\r\n,;\t|\s]+/)
    .map((s) => s.replace(/[<>"'()[\]{}]/g, '').trim())
    .filter((s) => s.length > 0 && !['email', 'emails', 'recipient', 'recipients', 'mail', 'to:'].includes(s.toLowerCase()));

  const seen = new Set<string>();
  const results: string[] = [];

  for (const raw of rawLines) {
    let email = raw.toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@example.com`;
    }
    if (!seen.has(email)) {
      seen.add(email);
      results.push(email);
    }
  }

  return results;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  onSuccess,
  onError,
}) => {
  const [senderName, setSenderName] = useState('Sasidhar');
  const [subject, setSubject] = useState('Project Collaboration & Updates');
  const [body, setBody] = useState(
    'Hi {{name}},\n\nI hope this email finds you well. I am following up on our project discussion and sharing the latest updates with you.\n\nPlease let me know if you have any questions or feedback.\n\nBest regards,\nSasidhar'
  );

  const [fileText, setFileText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const [startTime, setStartTime] = useState(formatLocalInputDefault());
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const parsedRecipients = parseRawEmails(fileText);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      let content = '';
      if (typeof file.text === 'function') {
        content = await file.text();
      } else {
        content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve((event.target?.result as string) || '');
          reader.readAsText(file);
        });
      }

      if (content) {
        setFileText(content.trim());
      } else {
        onError(`File "${file.name}" appears to be empty.`);
      }
    } catch (err: any) {
      onError(`Error reading file: ${err.message}`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const text = await file.text();
        setFileText(text.trim());
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => setFileText(((event.target?.result as string) || '').trim());
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      onError('Please enter an email subject.');
      return;
    }

    if (!body.trim()) {
      onError('Please enter an email body content.');
      return;
    }

    const finalEmails = parseRawEmails(fileText);

    if (finalEmails.length === 0) {
      onError('Please select a file or enter at least one recipient email.');
      return;
    }

    if (delaySeconds < 0) {
      onError('Delay must be a positive number.');
      return;
    }

    if (hourlyLimit < 1) {
      onError('Hourly limit must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const isoStartTime = new Date(startTime).toISOString();
      const delayBetweenEmails = Math.max(2000, delaySeconds * 1000);

      const result = await onSchedule({
        senderName: senderName.trim() || undefined,
        subject,
        body,
        recipients: finalEmails,
        startTime: isoStartTime,
        delayBetweenEmails,
        hourlyLimit,
      });

      onSuccess(result.totalEmails || finalEmails.length);
      onClose();
      setFileText('');
      setFileName(null);
    } catch (err: any) {
      onError(err.message || 'Failed to schedule email campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule New Outreach Campaign"
      description="Queue delayed BullMQ jobs with atomic Redis rate limiting and PostgreSQL persistence."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sender Name & Subject in 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sender Name Input */}
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>Sender Name (From Name)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sasidhar"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Introducing our enterprise product"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Body input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Email Body (HTML / Plain Text)
          </label>
          <textarea
            required
            rows={3}
            placeholder="Write your email template here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono transition-colors"
          />
        </div>

        {/* Recipients: Direct File Picker with Live File Content Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Upload Recipients File (.TXT or .CSV)
            </label>
            {parsedRecipients.length > 0 && (
              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{parsedRecipients.length} Recipient(s) Loaded</span>
              </span>
            )}
          </div>

          {/* Native File Selector */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>{fileName ? `Selected: ${fileName}` : 'Choose .txt or .csv file:'}</span>
            </div>
            <input
              type="file"
              accept="*/*"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
            />
          </div>

          {/* Editable File Content Area */}
          <textarea
            rows={3}
            placeholder="When you select your file, its contents will show here automatically, or you can type emails directly:&#10;sasidhars866@gmail.com&#10;john.doe@company.com"
            value={fileText}
            onChange={(e) => setFileText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono transition-colors leading-relaxed"
          />
        </div>

        {/* Timing Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Start Time */}
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Start Time</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          {/* Delay Between Emails */}
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              <Timer className="w-3.5 h-3.5 text-brand-400" />
              <span>Delay (Sec)</span>
            </label>
            <input
              type="number"
              min="2"
              step="1"
              required
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10) || 2)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
            <p className="text-[10px] text-slate-500 mt-1">Min 2s enforced</p>
          </div>

          {/* Hourly Sending Limit */}
          <div>
            <label className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-400" />
              <span>Hourly Limit</span>
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              required
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(parseInt(e.target.value, 10) || 100)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
            <p className="text-[10px] text-slate-500 mt-1">Atomic Redis window</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={<Send className="w-4 h-4" />}
          >
            Schedule Campaign {parsedRecipients.length > 0 ? `(${parsedRecipients.length} Emails)` : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
