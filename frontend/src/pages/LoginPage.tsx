import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Send, Shield, Zap, RefreshCw, Sparkles, Mail, ArrowRight, User } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, devLogin, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom email state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMessage('Authentication was canceled or had an error. Please try again.');
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    try {
      setErrorMessage(null);
      await loginWithEmail(customEmail.trim(), customName.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 text-white shadow-xl shadow-brand-500/30 ring-1 ring-white/20">
          <Send className="w-7 h-7" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ReachInbox
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          AI-powered outreach and distributed email scheduling platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl space-y-6">
          
          {/* Notification banner if error */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200">
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form: Login with your email */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. sasidhars866@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Name <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Sasidhar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-brand-500/30 text-sm font-semibold mt-1"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In with My Email
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              Or Other Options
            </span>
          </div>

          <div className="space-y-3">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-brand-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-sm">Sign in with Google</span>
            </button>

            {/* Quick Demo Button */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full justify-center text-xs"
              onClick={devLogin}
              loading={loading}
              icon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
            >
              1-Click Demo Architect Login
            </Button>
          </div>

          {/* Value Prop Badges */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
              <span>Idempotent</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
              <span>Rate Limited</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 text-brand-400 mx-auto mb-1" />
              <span>Zero-Cron</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
