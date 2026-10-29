import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClasses = 'bg-navy-900 border-emerald-500/40 text-emerald-400';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'bg-navy-900 border-rose-500/40 text-rose-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClasses = 'bg-navy-900 border-forensic-purple/40 text-forensic-purple';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-xl shadow-black/40 text-slate-100 animate-in slide-in-from-bottom-5 duration-200 ${colorClasses}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-white tracking-wide">{toast.title}</p>
              {toast.message && <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
