import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface ComingSoonViewProps {
  featureName?: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ featureName }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div
        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-inner"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          border: '1px solid var(--surface-border)',
        }}
      >
        <Clock className="w-8 h-8 text-primary-500" strokeWidth={1.8} />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          Module In Development
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {featureName ? `${featureName} • Coming Soon` : 'Feature Coming Soon'}
        </h1>
        <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          This route is temporarily disabled pending backend integration, security audits, and institutional verification services.
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Go Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/events')}>
          Browse Events
        </Button>
      </div>
    </div>
  );
};
