import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`soft-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto ${className}`}
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div
        className="w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-sm"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-muted)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <Icon className="w-7 h-7" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
