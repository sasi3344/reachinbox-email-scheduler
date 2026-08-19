import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { ToastMessage } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-400" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'info':
            default:
              return <Info className="w-5 h-5 text-brand-400" />;
          }
        };

        const getBorder = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-500/40 bg-slate-900/95';
            case 'error':
              return 'border-rose-500/40 bg-slate-900/95';
            case 'warning':
              return 'border-amber-500/40 bg-slate-900/95';
            case 'info':
            default:
              return 'border-brand-500/40 bg-slate-900/95';
          }
        };

        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0',
              getBorder()
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-400 mt-0.5 break-words">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
