import React, { useState, useEffect } from 'react';
import {
  getFeatureFlags,
  setFeatureFlagOverride,
  resetFeatureFlagOverrides,
  type FeatureFlags,
} from '@/lib/featureFlags';
import { Sliders, RefreshCw, X, ShieldAlert } from 'lucide-react';

/**
 * FeatureFlagsDebugPanel
 * Developer-only floating panel to inspect and hot-toggle feature flags at runtime.
 * Visible only in development or when explicitly enabled via query parameter (?debug_flags=true).
 */
export const FeatureFlagsDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());

  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('debug_flags=true'));

  useEffect(() => {
    const handleUpdate = () => {
      setFlags(getFeatureFlags());
    };
    window.addEventListener('campusos_feature_flags_updated', handleUpdate);
    return () => window.removeEventListener('campusos_feature_flags_updated', handleUpdate);
  }, []);

  if (!isDev) return null;

  const handleToggle = (flag: keyof FeatureFlags) => {
    const newVal = !flags[flag];
    setFeatureFlagOverride(flag, newVal);
    setFlags((prev) => ({ ...prev, [flag]: newVal }));
  };

  const handleReset = () => {
    resetFeatureFlagOverrides();
    setFlags(getFeatureFlags());
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-sans no-print text-xs">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open Feature Flags Debug Panel"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow-2xl backdrop-blur hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">Dev Flags</span>
        </button>
      ) : (
        <div className="w-80 rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl text-slate-100 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Feature Flags Debug</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(Object.keys(flags) as Array<keyof FeatureFlags>).map((flag) => (
              <label
                key={flag}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="pr-2">
                  <div className="font-mono text-[11px] font-semibold text-slate-200">{flag}</div>
                  <div className="text-[10px] text-slate-400">
                    {flag === 'ENABLE_REAL_SSO' && 'Enforce OIDC SSO vs mock auth'}
                    {flag === 'ENABLE_SKILL_SUBMISSION' && 'Enable departmental skill reviews'}
                    {flag === 'ENABLE_HONORS_VERIFICATION' && 'Honors accreditation pipeline'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flags[flag]}
                  onChange={() => handleToggle(flag)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                />
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Defaults
            </button>
            <span className="text-[10px] text-slate-400 font-mono">dev-mode active</span>
          </div>
        </div>
      )}
    </div>
  );
};
