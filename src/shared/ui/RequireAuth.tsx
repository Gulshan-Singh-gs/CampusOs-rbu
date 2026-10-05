import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/services/session/sessionStore';
import type { UserRole } from '@/shared/types/app.types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { profile, isLoading } = useSessionStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect to onboarding / login
  if (!profile) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If role check required and current role is insufficient
  if (allowedRoles && (!profile.role || !allowedRoles.includes(profile.role))) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Restricted University Access
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your profile role ({profile.role || 'student'}) does not have permission to view this administrative portal.
        </p>
        <Button variant="secondary" onClick={() => (window.location.href = '/events')}>
          Return to Events
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
