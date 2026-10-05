import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { EventsFeedView } from '@/features/events/components/EventsFeedView';
import { ClubsDirectoryView } from '@/features/clubs/components/ClubsDirectoryView';
import { WizardView } from '@/features/wizard/components/WizardView';
import { ApplicationsTrackerView } from '@/features/tracker/components/ApplicationsTrackerView';
import { OnboardingView } from '@/features/onboarding/components/OnboardingView';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsFeedView />} />
          <Route path="/clubs" element={<ClubsDirectoryView />} />
          <Route path="/wizard" element={<WizardView />} />
          <Route path="/applications" element={<ApplicationsTrackerView />} />
          <Route path="/onboarding" element={<OnboardingView />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};
