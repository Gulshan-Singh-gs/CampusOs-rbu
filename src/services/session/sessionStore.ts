import { create } from 'zustand';
import type { Profile, CreateProfileInput } from '@/shared/types/app.types';

interface SessionState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (input: CreateProfileInput) => void;
  clearSession: () => void;
}

const STORAGE_KEY = 'campusos_student_session';

export const useSessionStore = create<SessionState>((set) => {
  // Initialize from localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  let initialProfile: Profile | null = null;
  if (saved) {
    try {
      initialProfile = JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    profile: initialProfile,
    isLoading: false,
    setProfile: (input: CreateProfileInput) => {
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      set({ profile: newProfile });
    },
    clearSession: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ profile: null });
    },
  };
});
