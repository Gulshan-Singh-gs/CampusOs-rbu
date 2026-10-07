import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  Users2,
  FileSignature,
  FileCheck2,
  GraduationCap,
  Sun,
  Moon,
  Sparkles,
  Award,
  Users,
  Compass,
  Bell,
  Camera,
} from 'lucide-react';
import { useSessionStore } from '@/services/session/sessionStore';
import { useThemeStore } from '@/shared/hooks/useThemeStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { profile } = useSessionStore();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { to: '/events', icon: CalendarDays, label: 'Events Hub' },
    { to: '/clubs', icon: Users2, label: 'Societies' },
    { to: '/passport', icon: Award, label: 'Campus Passport' },
    { to: '/coming-soon', icon: Users, label: 'Social Graph (Soon)' },
    { to: '/coming-soon', icon: Sparkles, label: 'Squad Swipe (Soon)' },
    { to: '/coming-soon', icon: Camera, label: 'Campus Moments (Soon)' },
    { to: '/coming-soon', icon: Compass, label: 'Study Radar (Soon)' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/wizard', icon: FileSignature, label: 'Doc Wizard' },
    { to: '/applications', icon: FileCheck2, label: 'Applications' },
    { to: '/admin', icon: GraduationCap, label: 'Review Portal' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row transition-colors"
      style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-primary)' }}
    >
      {/* Desktop Sidebar (>= 1024px) */}
      <aside
        className="hidden lg:flex lg:w-72 flex-col justify-between p-6 sticky top-0 h-screen no-print border-r overflow-y-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--surface-border)',
        }}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 100%)',
                border: '1px solid var(--surface-border)',
              }}
            >
              <GraduationCap className="w-6 h-6 text-slate-800" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  CampusOS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  RBU
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Rayat Bahra University
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'shadow-sm font-semibold'
                        : 'opacity-70 hover:opacity-100 hover:translate-x-0.5'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--surface-border)' : '1px solid transparent',
                  })}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: User profile & Theme toggle */}
        <div className="pt-4 border-t space-y-3 shrink-0" style={{ borderColor: 'var(--surface-border)' }}>
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--surface-border)',
            }}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Toggle</span>
          </button>

          {profile ? (
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--surface-border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  background: 'var(--surface-dark)',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.fullName}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {profile.rollNumber} • {profile.department}
                </p>
              </div>
            </div>
          ) : (
            <NavLink
              to="/onboarding"
              className="flex items-center justify-center gap-2 text-xs font-semibold p-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--surface-border)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Set Up Profile
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile / Tablet TopBar */}
        <header
          className="lg:hidden h-16 border-b px-5 flex items-center justify-between sticky top-0 z-40 no-print backdrop-blur-md"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--surface-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: 'var(--card-bg)' }}
            >
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CampusOS
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              RBU
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--surface-border)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {profile ? (
              <NavLink
                to="/passport"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--surface-border)' }}
              >
                <span className="max-w-[90px] truncate">{profile.fullName.split(' ')[0]}</span>
              </NavLink>
            ) : (
              <NavLink
                to="/onboarding"
                className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 pb-24 lg:pb-12">{children}</main>

        {/* Mobile Fixed Bottom Nav (< 1024px) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t z-40 flex items-center justify-around px-2 no-print backdrop-blur-lg"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--surface-border)',
          }}
        >
          {[
            { to: '/events', icon: CalendarDays, label: 'Events' },
            { to: '/passport', icon: Award, label: 'Passport' },
            { to: '/coming-soon', icon: Sparkles, label: 'Squad' },
            { to: '/coming-soon', icon: Users, label: 'Peers' },
            { to: '/wizard', icon: FileSignature, label: 'Wizard' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-16 py-1 text-[11px] font-medium transition-all ${
                    isActive ? 'font-bold' : 'opacity-60 hover:opacity-100'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
