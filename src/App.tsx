import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { RequireAuth } from '@/shared/ui/RequireAuth';
import { useSessionStore } from '@/services/session/sessionStore';
import { FeatureFlagsDebugPanel } from '@/shared/ui/FeatureFlagsDebugPanel';

// Code-split route modules for maximum free-tier bandwidth optimization & instant mobile loads
const EventsFeedView = lazy(() =>
  import('@/features/events/components/EventsFeedView').then((m) => ({ default: m.EventsFeedView }))
);
const ClubsDirectoryView = lazy(() =>
  import('@/features/clubs/components/ClubsDirectoryView').then((m) => ({ default: m.ClubsDirectoryView }))
);
const WizardView = lazy(() =>
  import('@/features/wizard/components/WizardView').then((m) => ({ default: m.WizardView }))
);
const ApplicationsTrackerView = lazy(() =>
  import('@/features/tracker/components/ApplicationsTrackerView').then((m) => ({
    default: m.ApplicationsTrackerView,
  }))
);
const AdminPortalView = lazy(() =>
  import('@/features/tracker/components/AdminPortalView').then((m) => ({ default: m.AdminPortalView }))
);
const OnboardingView = lazy(() =>
  import('@/features/onboarding/components/OnboardingView').then((m) => ({ default: m.OnboardingView }))
);
const CampusPassportView = lazy(() =>
  import('@/features/passport/components/CampusPassportView').then((m) => ({
    default: m.CampusPassportView,
  }))
);

const NotificationsCenterView = lazy(() =>
  import('@/features/notifications/components/NotificationsCenterView').then((m) => ({
    default: m.NotificationsCenterView,
  }))
);

const ComingSoonView = lazy(() =>
  import('@/shared/ui/ComingSoonView').then((m) => ({ default: m.ComingSoonView }))
);

const EphemeralChatView = lazy(() =>
  import('@/features/chat/components/EphemeralChatView').then((m) => ({ default: m.EphemeralChatView }))
);

const RouteLoadingSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
    <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    <span className="text-xs font-medium text-slate-400">Loading Campus Module...</span>
  </div>
);

export const App: React.FC = () => {
  const { initializeAuthListener } = useSessionStore();

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell>
          <Suspense fallback={<RouteLoadingSkeleton />}>
            <Routes>
              {/* Core Discovery */}
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/events" element={<EventsFeedView />} />
              <Route path="/clubs" element={<ClubsDirectoryView />} />

              {/* Verified Identity & Social Graph */}
              <Route
                path="/passport"
                element={
                  <RequireAuth>
                    <CampusPassportView />
                  </RequireAuth>
                }
              />
              <Route
                path="/passport/:uid"
                element={
                  <RequireAuth>
                    <CampusPassportView />
                  </RequireAuth>
                }
              />
              <Route path="/coming-soon" element={<ComingSoonView />} />
              <Route path="/peers" element={<ComingSoonView featureName="Social Graph" />} />
              <Route path="/squad" element={<ComingSoonView featureName="Squad Swipe" />} />
              <Route
                path="/chat"
                element={
                  <RequireAuth>
                    <EphemeralChatView />
                  </RequireAuth>
                }
              />
              <Route path="/stories" element={<ComingSoonView featureName="Campus Moments" />} />
              <Route path="/study-radar" element={<ComingSoonView featureName="Study Radar" />} />
              <Route path="/notifications" element={<NotificationsCenterView />} />

              {/* Administrative & Document Workflow */}
              <Route path="/wizard" element={<WizardView />} />
              <Route path="/applications" element={<ApplicationsTrackerView />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth allowedRoles={['hod', 'dsw_admin', 'super_admin']}>
                    <AdminPortalView />
                  </RequireAuth>
                }
              />
              <Route path="/onboarding" element={<OnboardingView />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </Suspense>
        </AppShell>
        <FeatureFlagsDebugPanel />
      </ErrorBoundary>
    </BrowserRouter>
  );
};
