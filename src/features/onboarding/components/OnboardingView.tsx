import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/services/session/sessionStore';
import { DEPARTMENTS } from '@/shared/lib/constants';
import { Input, Select } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { GraduationCap, ShieldCheck, Check, KeyRound } from 'lucide-react';
import type { Department } from '@/shared/types/app.types';
import { ProfileInputSchema } from '@/shared/lib/validation';
import { recordAuditLog } from '@/services/api/auditService';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { authAdapter } from '@/lib/auth';

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useSessionStore();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '');
  const [department, setDepartment] = useState<Department>(profile?.department || 'CSE');
  const [yearOfStudy, setYearOfStudy] = useState<number>(profile?.yearOfStudy || 2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = ProfileInputSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department,
      yearOfStudy: Number(yearOfStudy),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setProfile(result.data);

    recordAuditLog('PROFILE_UPDATED', 'profile', null, {
      fullName: result.data.fullName,
      rollNumber: result.data.rollNumber,
      department: result.data.department,
    });

    navigate('/events');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-14 space-y-8">
      {/* Header with Circular Emblem */}
      <div className="text-center space-y-3">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 100%)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <GraduationCap className="w-8 h-8 text-slate-800" strokeWidth={1.8} />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Student Verification
        </h1>
        <p className="text-sm font-normal max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Enter your Rayat Bahra University credentials to activate 1-tap RSVPs and document
          automation.
        </p>
      </div>

      <div className="soft-card p-6 sm:p-8 space-y-6">
        {isFeatureEnabled('ENABLE_REAL_SSO') && (
          <div className="space-y-3 pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Institutional Single Sign-On
            </p>
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => authAdapter.login()}
              className="flex items-center justify-center gap-2 border-primary-500 text-primary-600 dark:text-primary-400"
            >
              <KeyRound className="w-4 h-4" />
              Sign In with University OIDC SSO
            </Button>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--surface-border)' }} />
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">or manual registration</span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--surface-border)' }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="e.g. Aaravpreet Singh"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. aarav.singh@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            helperText="Open access: Personal Gmail or college email supported."
            required
          />

          <Input
            label="University Roll Number (UID)"
            name="rollNumber"
            placeholder="e.g. RBU21CSE045"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            error={errors.rollNumber}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              required
            />

            <Select
              label="Year of Study"
              name="yearOfStudy"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
              options={[
                { value: 1, label: '1st Year' },
                { value: 2, label: '2nd Year' },
                { value: 3, label: '3rd Year' },
                { value: 4, label: '4th Year' },
                { value: 5, label: '5th Year' },
              ]}
              required
            />
          </div>

          <div className="pt-3">
            <Button type="submit" variant="primary" fullWidth size="lg">
              <Check className="w-4 h-4 mr-2" />
              {profile ? 'Update Profile' : 'Complete Verification'}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t text-center" style={{ borderColor: 'var(--surface-border)' }}>
          <p
            className="text-xs flex items-center justify-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Institutional Access Control & Data Minimization Active
          </p>
        </div>
      </div>
    </div>
  );
};
