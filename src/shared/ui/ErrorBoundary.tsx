import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { trackError } from '@/lib/telemetry';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    trackError(error, errorInfo.componentStack || undefined);
    console.error('CampusOS Uncaught View Error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div className="soft-card max-w-md p-8 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                CampusOS encountered an unexpected error while rendering this module. Your data remains safe.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="secondary" onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload View
              </Button>
              <Button variant="primary" onClick={() => (window.location.href = '/')}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
