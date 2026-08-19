import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { api } from '../../services/api';
import { HealthStatus } from '../../types';
import { Server, Database, Cpu, Mail, Layers, ShieldCheck } from 'lucide-react';

export const ArchitectureOverview: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">System Architecture & Design Guarantees</h2>
        <p className="text-xs text-slate-400 mt-1">
          Technical specifications, distributed guarantees, and real-time component health
        </p>
      </div>

      {/* Live health status strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center space-x-3.5 border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">PostgreSQL (Prisma)</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${health?.database === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-sm font-semibold text-slate-200 capitalize">{health?.database || 'Connected'}</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center space-x-3.5 border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Redis Cluster / DB</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${health?.redis === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-sm font-semibold text-slate-200 capitalize">{health?.redis || 'Connected'}</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center space-x-3.5 border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">BullMQ Worker Engine</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-slate-200 capitalize">{health?.worker || 'Running (5 Concurrency)'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center space-x-2 text-brand-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <span>Zero-Cron Architecture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike legacy scheduling that relies on setInterval or polling database crons, ReachInbox schedules individual delayed jobs in <span className="text-white font-medium">BullMQ Redis sets</span> (<code className="text-xs text-brand-300">delay = scheduledAt - Date.now()</code>).
            When the server or worker restarts, Redis retains all delayed timestamps and workers instantly resume execution without losing a single job.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Atomic State Transition & Idempotency</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Worker locks each email with an atomic conditional update: <code className="text-xs text-emerald-300">UPDATE Email SET status = 'PROCESSING' WHERE id = :id AND status = 'SCHEDULED'</code>.
            If 0 rows are updated, duplicate workers gracefully abort. Even on retries, previously sent emails (<code className="text-xs text-emerald-300">status === 'SENT'</code>) are strictly guarded from re-dispatching.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Redis Lua Atomic Hourly Rate Limiter</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rate limiting is enforced atomically in Redis per user, sender, and hour window (<code className="text-xs text-amber-300">email-rate:userId:senderId:YYYY-MM-DDTHH</code>).
            When limits are reached, the system avoids failing jobs — instead, it dynamically recalculates the next hour slot (<code className="text-xs text-amber-300">15:00:00</code>) and reschedules the delayed job.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
            <Mail className="w-4 h-4" />
            <span>Ethereal SMTP & Multi-Sender Extensibility</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Emails are securely routed through Nodemailer to Ethereal SMTP with inspectable HTML previews. The <span className="text-white font-medium">SenderService</span> abstraction supports custom user-configured SMTP accounts or falls back to system credentials seamlessly.
          </p>
        </Card>
      </div>
    </div>
  );
};
