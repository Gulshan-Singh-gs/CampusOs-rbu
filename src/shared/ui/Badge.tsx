import React from 'react';
import { cn } from './Button';
import { CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';
import type { ApplicationStatus } from '@/shared/types/app.types';

export interface StatusBadgeProps {
  status: ApplicationStatus | 'Draft';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = {
    Approved: {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    'Pending Review': {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: Clock,
    },
    Rejected: {
      bg: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: XCircle,
    },
    Expired: {
      bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: XCircle,
    },
    Draft: {
      bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: FileEdit,
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border',
        config.bg,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export interface GenericBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

export const Badge: React.FC<GenericBadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const styles = {
    default: 'bg-slate-700/50 text-slate-200 border-slate-600/50',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles,
        className
      )}
    >
      {children}
    </span>
  );
};
