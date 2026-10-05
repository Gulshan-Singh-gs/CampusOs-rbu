import React from 'react';
import { cn } from './Button';
import { CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';
import type { ApplicationStatus } from '@/shared/types/app.types';

export interface BadgeProps {
  status: ApplicationStatus | 'Draft';
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className }) => {
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
