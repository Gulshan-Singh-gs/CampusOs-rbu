/**
 * CampusOS Feature Flag Engine
 * Manages runtime and build-time feature toggles for safe, gradual institutional rollouts.
 *
 * Configured via:
 * 1. Environment variable: VITE_FEATURE_FLAGS (JSON string)
 * 2. LocalStorage override: campusos_feature_flags (Developer debug panel)
 */

export interface FeatureFlags {
  ENABLE_REAL_SSO: boolean;
  ENABLE_SKILL_SUBMISSION: boolean;
  ENABLE_HONORS_VERIFICATION: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  ENABLE_REAL_SSO: false,
  ENABLE_SKILL_SUBMISSION: true,
  ENABLE_HONORS_VERIFICATION: false,
};

const STORAGE_KEY = 'campusos_feature_flags_override';

/**
 * Parses initial flags from VITE_FEATURE_FLAGS env variable
 */
function parseEnvFlags(): Partial<FeatureFlags> {
  const envVal = import.meta.env.VITE_FEATURE_FLAGS;
  if (!envVal) return {};
  try {
    return typeof envVal === 'string' ? JSON.parse(envVal) : envVal;
  } catch (err) {
    console.warn('Failed to parse VITE_FEATURE_FLAGS JSON:', err);
    return {};
  }
}

/**
 * Retrieves persisted developer overrides from localStorage
 */
function getStorageOverrides(): Partial<FeatureFlags> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Returns active feature flag values merging defaults, env vars, and dev overrides
 */
export function getFeatureFlags(): FeatureFlags {
  const envFlags = parseEnvFlags();
  const overrides = getStorageOverrides();
  return {
    ...defaultFeatureFlags,
    ...envFlags,
    ...overrides,
  };
}

/**
 * Checks whether a specific feature flag is currently active
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return Boolean(flags[flag]);
}

/**
 * Updates a feature flag override (for Dev Debug Panel)
 */
export function setFeatureFlagOverride(flag: keyof FeatureFlags, enabled: boolean): void {
  const current = getStorageOverrides();
  const updated = { ...current, [flag]: enabled };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('campusos_feature_flags_updated', { detail: updated }));
}

/**
 * Resets all overrides to system defaults
 */
export function resetFeatureFlagOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('campusos_feature_flags_updated', { detail: {} }));
}
