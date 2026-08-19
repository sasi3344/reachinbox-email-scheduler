import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api, SaveSmtpPayload } from '../../services/api';
import { Mail, Server, Key, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface SmtpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const SmtpSettingsModal: React.FC<SmtpSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState(587);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSmtpSettings().then((data) => {
        if (data.email) setEmail(data.email);
        if (data.user) setUser(data.user);
        if (data.host) setHost(data.host);
        if (data.port) setPort(data.port);
        setIsCustom(Boolean(data.isCustom));
      });
    }
  }, [isOpen]);

  const handleQuickGmailSetup = () => {
    setHost('smtp.gmail.com');
    setPort(587);
    if (!email) setEmail('sasidhars866@gmail.com');
    if (!user) setUser('sasidhars866@gmail.com');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user || !pass) {
      onError('Please fill in your email, username, and password / app-password.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: SaveSmtpPayload = {
        email,
        host,
        port: Number(port) || 587,
        user,
        pass,
      };
      await api.saveSmtpSettings(payload);
      setIsCustom(true);
      onSuccess('SMTP Settings Saved! All subsequent scheduled emails will be delivered directly via your SMTP account.');
      onClose();
    } catch (err: any) {
      onError(err.message || 'Failed to save SMTP settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Outgoing SMTP Sender"
      description="Switch between Ethereal Sandbox (test preview URLs) and Real Gmail / SMTP delivery."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Status Indicator */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span className="text-xs text-slate-300 font-medium">
              Current Mode: {isCustom ? '🚀 Real Delivery (Custom SMTP)' : '🧪 Ethereal Sandbox (Test URLs)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickGmailSetup}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold underline"
          >
            ⚡ Quick-Fill Gmail
          </button>
        </div>

        {/* Info banner explaining Gmail App Passwords */}
        <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-800/40 text-xs text-brand-200 flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            For Gmail accounts, use your Gmail address and generate a 16-letter <strong>Google App Password</strong> at{' '}
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noreferrer"
              className="underline text-white font-medium"
            >
              myaccount.google.com/apppasswords
            </a>.
          </p>
        </div>

        {/* Sender Email & Host */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Sender Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              SMTP Host
            </label>
            <div className="relative">
              <Server className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="smtp.gmail.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Port, User & App Password */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Port
            </label>
            <input
              type="number"
              required
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value, 10) || 587)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              required
              placeholder="you@gmail.com"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              App Password
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="16-letter key"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save & Activate Real SMTP
          </Button>
        </div>
      </form>
    </Modal>
  );
};
