import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, title, message, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
    },
    info: {
      icon: Info,
      color: 'text-blue-500',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl max-w-sm w-full transition-all animate-in fade-in slide-in-from-bottom-3 duration-200`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--surface-border)',
        boxShadow: 'var(--service-shadow)',
      }}
    >
      <div className={`p-1.5 rounded-full ${config.bg} ${config.color} shrink-0`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h5 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h5>
        {message && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="opacity-50 hover:opacity-100 transition-opacity p-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
