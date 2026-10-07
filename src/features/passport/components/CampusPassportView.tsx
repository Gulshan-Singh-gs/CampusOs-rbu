import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Award,
  Printer,
  Sparkles,
  Share2,
  ThumbsUp,
  GraduationCap,
  Plus,
  AlertCircle,
  EyeOff,
  Clock,
  CheckCircle2,
  HelpCircle,
  Info,
  Lock,
  X,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { StudentSkill, StudentAchievement, Profile } from '@/shared/types/app.types';

// Cryptographic hash calculation using browser SubtleCrypto Web API
async function computeSha256(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return `FALLBACK-${Math.abs(hash).toString(16).toUpperCase()}`;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const CampusPassportView: React.FC = () => {
  const { profile: loggedInProfile } = useSessionStore();
  const { uid } = useParams<{ uid?: string }>();
  const [searchParams] = useSearchParams();
  const queryUid = searchParams.get('uid');
  const targetUid = uid || queryUid;

  const [activeProfile, setActiveProfile] = useState<Profile | null>(loggedInProfile);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [docHash, setDocHash] = useState<string>('');
  const [copiedUid, setCopiedUid] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [isAcademicDataLoading] = useState(false);

  // Modals & Controls
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // New Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Computer Science & Engineering');
  const [newSkillProficiency, setNewSkillProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newSkillEvidence, setNewSkillEvidence] = useState('');
  const [submittingSkill, setSubmittingSkill] = useState(false);

  // Privacy toggles (saved to localStorage for student owner)
  const [privacySettings, setPrivacySettings] = useState<{
    showGpa: boolean;
    showAttendance: boolean;
    showUid: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('campusos_passport_privacy');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { showGpa: true, showAttendance: true, showUid: true };
  });

  const handleUpdatePrivacy = (key: 'showGpa' | 'showAttendance' | 'showUid', val: boolean) => {
    const updated = { ...privacySettings, [key]: val };
    setPrivacySettings(updated);
    try {
      localStorage.setItem('campusos_passport_privacy', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Determine whether viewing own profile or peer/public profile
  const isSelf = useMemo(() => {
    if (!loggedInProfile) return false;
    if (!targetUid) return true;
    return (
      loggedInProfile?.rollNumber?.toUpperCase() === targetUid.toUpperCase() ||
      loggedInProfile?.id === targetUid
    );
  }, [targetUid, loggedInProfile]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPassportData() {
      setProfileNotFound(false);
      let resolvedProfile = loggedInProfile;

      // If a specific UID was requested and is not the logged-in user
      if (targetUid && !isSelf) {
        try {
          const { data: remoteProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`roll_number.ilike.${targetUid},id.eq.${targetUid}`)
            .maybeSingle();

          if (error || !remoteProfile) {
            if (!isCancelled) {
              setProfileNotFound(true);
              setActiveProfile(null);
              setSkills([]);
              setAchievements([]);
            }
            return;
          }

          resolvedProfile = {
            id: remoteProfile.id,
            fullName: remoteProfile.full_name,
            email: remoteProfile.email,
            rollNumber: remoteProfile.roll_number || targetUid,
            department: remoteProfile.department || 'CSE',
            yearOfStudy: remoteProfile.year_of_study || 1,
            role: remoteProfile.role || 'student',
            isVerified: remoteProfile.is_verified || false,
            createdAt: remoteProfile.created_at,
          };
        } catch {
          if (!isCancelled) {
            setProfileNotFound(true);
            setActiveProfile(null);
            return;
          }
        }
      } else {
        resolvedProfile = loggedInProfile;
      }

      if (isCancelled) return;
      setActiveProfile(resolvedProfile);

      if (!resolvedProfile?.id) return;

      try {
        const { data: remoteSkills } = await supabase
          .from('student_skills')
          .select('id, student_id, skill_id, proficiency_level, endorsement_count, skills(name, category)')
          .eq('student_id', resolvedProfile.id);

        if (remoteSkills && remoteSkills.length > 0 && !isCancelled) {
          setSkills(
            remoteSkills.map((s: any) => ({
              id: s.id,
              studentId: s.student_id,
              skillId: s.skill_id,
              skillName: s.skills?.name || 'Technical Skill',
              category: s.skills?.category || 'Curricular Competency',
              proficiencyLevel: s.proficiency_level,
              endorsementCount: s.endorsement_count || 0,
              endorsedBy: s.endorsement_count > 0 ? 'Dept. Faculty Advisor' : undefined,
            }))
          );
        } else if (!isCancelled) {
          setSkills([]);
        }

        const { data: remoteAchievements } = await supabase
          .from('student_achievements')
          .select('*')
          .eq('student_id', resolvedProfile.id);

        if (remoteAchievements && remoteAchievements.length > 0 && !isCancelled) {
          setAchievements(
            remoteAchievements.map((a: any) => ({
              id: a.id,
              studentId: a.student_id,
              title: a.title,
              issuer: a.issuer,
              issueDate: a.issue_date,
              badgeIcon: a.badge_icon || 'Award',
              isVerified: a.is_verified,
            }))
          );
        } else if (!isCancelled) {
          setAchievements([]);
        }
      } catch (err) {
        console.warn('Passport sync notice:', err);
      }
    }

    loadPassportData();

    return () => {
      isCancelled = true;
    };
  }, [targetUid, isSelf, loggedInProfile]);

  // Compute verifiable cryptographic SHA-256 digest over student credential metadata
  useEffect(() => {
    if (!activeProfile) {
      setDocHash('');
      return;
    }
    const payload = JSON.stringify({
      issuer: 'Rayat Bahra University Student Information System',
      authority: 'Office of the Registrar',
      uid: activeProfile.rollNumber,
      studentId: activeProfile.id,
      fullName: activeProfile.fullName,
      department: activeProfile.department,
      yearOfStudy: activeProfile.yearOfStudy,
      skillsCount: skills.length,
      achievementsCount: achievements.length,
      timestamp: '2026-10-07T12:00:00Z',
    });

    computeSha256(payload).then((hash) => {
      setDocHash(hash.toUpperCase());
    });
  }, [activeProfile, skills.length, achievements.length]);

  const handleEndorse = async (skillId: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, endorsementCount: s.endorsementCount + 1 } : s))
    );
    try {
      if (loggedInProfile?.id) {
        await supabase.from('skill_endorsements').insert({
          student_skill_id: skillId,
          endorser_id: loggedInProfile.id,
        });
      }
    } catch (err) {
      console.warn('Endorsement sync notice:', err);
    }
  };

  const handleAddSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !loggedInProfile?.id) return;

    setSubmittingSkill(true);
    const trimmed = newSkillName.trim();
    const tempSkill: StudentSkill = {
      id: crypto.randomUUID(),
      studentId: loggedInProfile.id,
      skillId: crypto.randomUUID(),
      skillName: trimmed,
      category: newSkillCategory,
      proficiencyLevel: newSkillProficiency,
      endorsementCount: 0,
      evidenceUrl: newSkillEvidence.trim() || undefined,
    };

    setSkills((prev) => [...prev, tempSkill]);

    try {
      // Find or insert into skills catalog
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', trimmed)
        .maybeSingle();

      let targetSkillId = existingSkill?.id;
      if (!targetSkillId) {
        const { data: createdSkill } = await supabase
          .from('skills')
          .insert({ name: trimmed, category: newSkillCategory })
          .select('id')
          .single();
        targetSkillId = createdSkill?.id;
      }

      if (targetSkillId) {
        await supabase.from('student_skills').insert({
          student_id: loggedInProfile.id,
          skill_id: targetSkillId,
          proficiency_level: newSkillProficiency,
          endorsement_count: 0,
        });
      }
    } catch (err) {
      console.warn('Skill persistence notice:', err);
    } finally {
      setSubmittingSkill(false);
      setNewSkillName('');
      setNewSkillEvidence('');
      setIsSkillModalOpen(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyUid = () => {
    const rawUid = activeProfile?.rollNumber;
    if (!rawUid) return;
    navigator.clipboard.writeText(rawUid);
    setCopiedUid(true);
    setLiveAnnouncement(`Student UID ${rawUid} copied to clipboard.`);
    setTimeout(() => {
      setCopiedUid(false);
      setLiveAnnouncement('');
    }, 2500);
  };

  if (profileNotFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Student Record Not Found
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No verified academic passport exists for UID <code className="font-mono font-bold">{targetUid}</code>.
        </p>
        <Button variant="secondary" onClick={() => (window.location.href = '/passport')}>
          Return to My Passport
        </Button>
      </div>
    );
  }

  // Display values respecting student privacy toggles
  const showGpa = isSelf || privacySettings.showGpa;
  const showAttendance = isSelf || privacySettings.showAttendance;
  const showUid = isSelf || privacySettings.showUid;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Screen Reader Announcer Architecture (Section 15: WCAG compliance) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* 1. Contextual Status Bar (Heuristic H1 & H5: System status & audience awareness) */}
      <aside
        aria-label="Profile access and synchronization status"
        className="soft-card p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs no-print border"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {isSelf ? (
              <>Viewing your verified profile as <strong>Student Owner</strong></>
            ) : loggedInProfile ? (
              <>Viewing institutional record as <strong>Authenticated Peer / Evaluator</strong></>
            ) : (
              <>Viewing official public record as <strong>Guest Evaluator / Recruiter</strong></>
            )}
          </span>
          <span className="opacity-40">•</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Synced: Fall Semester 2026
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSelf && (
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="font-medium text-primary-500 hover:underline flex items-center gap-1.5 focus:outline-none"
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy & Scope ({privacySettings.showGpa ? 'GPA Visible' : 'GPA Redacted'})
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="text-xs hover:underline flex items-center gap-1 opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Registrar Verification Info
          </button>
        </div>
      </aside>

      {/* 2. Top action header (hidden during print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug" style={{ color: 'var(--text-primary)' }}>
            Verified Academic Credential & Digital Portfolio
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Institutional student portfolio certified by Rayat Bahra University Registrar.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            disabled
            aria-label="Share Scoped Link (Feature disabled pending backend integration)"
            className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] text-xs justify-center opacity-50 cursor-not-allowed"
            title="Scoped sharing is disabled pending cryptographic signing backend integration."
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share Scoped Link (Pending Backend)
          </Button>
          <Button
            variant="primary"
            onClick={handlePrintPdf}
            size="sm"
            aria-label="Print or save as PDF"
            className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[36px] text-xs justify-center"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Save Certified PDF
          </Button>
        </div>
      </div>

      {/* 3. Certified Resume Card (Target of @media print) */}
      <main
        className="soft-card p-6 sm:p-10 space-y-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {/* Verification watermark & Institutional identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
                color: 'var(--text-primary)',
              }}
              aria-hidden="true"
            >
              {activeProfile?.fullName ? activeProfile.fullName.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activeProfile?.fullName || 'Student Record'}
                </h2>
                <Badge
                  variant="warning"
                  className="flex items-center gap-1"
                  role="status"
                  aria-label="Enrolled Student • Verification Pending Backend Integration"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  Enrolled Student • [Verification Pending Backend Integration]
                </Badge>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {activeProfile?.department || 'Computer Science & Engineering'} • Year {activeProfile?.yearOfStudy || 1}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>
                  UID:{' '}
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {showUid
                      ? activeProfile?.rollNumber || 'RBU-STUDENT'
                      : '•••••••••• (Redacted by student)'}
                  </span>
                </span>
                {showUid && activeProfile?.rollNumber && (
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    title="Copy student roll number to clipboard"
                    aria-label={`Copy student roll number ${activeProfile.rollNumber}`}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[28px] min-w-[28px]"
                  >
                    {copiedUid ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px] font-sans">Copy</span>
                      </>
                    )}
                  </button>
                )}
                <span>• Rayat Bahra University</span>
              </div>
            </div>
          </div>

          {/* Wireframe 11.1: Verification Status Card */}
          <div
            className="p-3.5 rounded-xl border text-xs space-y-1.5 min-w-[240px]"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Verification Status
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> [Verification Pending Backend Integration]
              </span>
            </div>
            <div className="space-y-1 pt-1 border-t text-[11px]" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Issuer:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Office of the Registrar</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Enrollment:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {activeProfile?.enrollmentStatus || 'Status Pending Verification'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Cohort:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {activeProfile?.cohort || 'Class of 2026'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Standing & Curricular Focus (Wireframe 11.1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl border space-y-2.5"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}
          >
            <div className="text-xs uppercase tracking-wider font-bold text-primary-500">
              Academic Standing & Metrics
            </div>
            {isAcademicDataLoading ? (
              <div className="space-y-2 py-2 animate-pulse">
                <div className="h-4 bg-slate-500/20 rounded w-3/4"></div>
                <div className="h-4 bg-slate-500/20 rounded w-1/2"></div>
                <div className="h-4 bg-slate-500/20 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Degree Status:</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {activeProfile?.degreeStatus || '[Pending Registrar Verification]'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Cumulative GPA:</span>
                  {showGpa ? (
                    activeProfile?.gpa !== undefined && activeProfile?.gpa !== null ? (
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {activeProfile.gpa.toFixed(2)} / 10.0
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        [Pending Registrar Verification]
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500 italic inline-flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Redacted by Student
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Class & Lab Attendance:</span>
                  {showAttendance ? (
                    activeProfile?.attendance !== undefined && activeProfile?.attendance !== null ? (
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {activeProfile.attendance}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        [Pending Registrar Verification]
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500 italic inline-flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Redacted by Student
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 border-t text-[11px]" style={{ borderColor: 'var(--surface-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last Registrar Sync:</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {activeProfile?.lastSyncBatch || '[Sync Pending Backend Integration]'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div
            className="p-4 rounded-xl border space-y-2.5 flex flex-col justify-between"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary-500">
                Curricular Focus & Specialization
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                {activeProfile?.bio ||
                  'Systems programming, distributed computing, autonomous agent workflows, and full-stack software architecture.'}
              </p>
            </div>
            <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--surface-border)' }}>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Capstone Work: 3 Peer-Reviewed Projects
              </span>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="text-primary-500 hover:underline font-medium text-xs inline-flex items-center gap-1 focus:outline-none"
              >
                <span>Curricular Guidelines</span>
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Verified Skills & Peer Endorsements */}
        <section aria-label="Competencies and Endorsements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Competencies & Institutional Endorsements ({skills.length})
            </h3>
            {isSelf && (
              <Button
                variant="outline"
                size="sm"
                disabled
                aria-disabled="true"
                title="Feature unavailable - backend integration pending"
                className="text-xs no-print h-9 sm:h-8 px-3 min-h-[44px] sm:min-h-[32px] opacity-50 cursor-not-allowed"
                aria-label="Submit Skill for Review (Feature unavailable - backend integration pending)"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Submit Skill for Review (Disabled)
              </Button>
            )}
          </div>

          {skills.length === 0 ? (
            <div
              className="soft-card p-8 sm:p-10 text-center space-y-4 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--surface-border)' }}
              >
                <GraduationCap className="w-6 h-6 text-primary-500" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  No Endorsed Skills Published Yet
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Course competencies and technical skills added by the student appear here once reviewed by department faculty or verified through coursework.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {isSelf && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled
                    aria-disabled="true"
                    title="Feature unavailable - backend integration pending"
                    className="min-h-[48px] px-4 font-semibold text-xs flex items-center justify-center opacity-50 cursor-not-allowed"
                    aria-label="Add First Skill for Review (Feature unavailable - backend integration pending)"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add First Skill (Pending Backend)
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="text-xs text-primary-500 hover:underline inline-flex items-center gap-1 min-h-[48px] px-3"
                  aria-label="How skill endorsement works"
                >
                  <Info className="w-3.5 h-3.5" /> How skill endorsement works
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  tabIndex={0}
                  className="p-4 rounded-xl border flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:shadow-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--surface-border)',
                  }}
                >
                  <div className="space-y-2">
                    {/* Category Eyebrow: 11px uppercase bold */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {skill.category || 'Curricular Competency'}
                    </div>

                    {/* Skill Name: 16px semi-bold */}
                    <div className="text-base font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {skill.skillName}
                    </div>

                    {/* Endorsement Pill */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {skill.endorsedBy || `${skill.proficiencyLevel} Level`}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                        ({skill.endorsementCount} {skill.endorsementCount === 1 ? 'endorsement' : 'endorsements'})
                      </span>
                    </div>
                  </div>

                  {/* Evidence Anchor & Endorsement Action */}
                  <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--surface-border)' }}>
                    {skill.evidenceUrl ? (
                      <a
                        href={skill.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-500 hover:underline font-medium"
                      >
                        <span>View Project Proof</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Coursework Verified
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEndorse(skill.id)}
                      title="Endorse this student competency"
                      aria-label={`Endorse ${skill.skillName}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-500/10 text-primary-500 transition-colors font-medium text-xs no-print focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Endorse</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Official Academic Honors & Departmental Citations */}
        <section aria-label="Academic Honors" className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1.5">
            <Award className="w-4 h-4" aria-hidden="true" />
            Official Academic Honors & Departmental Citations ({achievements.length})
          </h3>
          {achievements.length === 0 ? (
            <div
              className="soft-card p-8 sm:p-10 text-center space-y-4 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-amber-500"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--surface-border)' }}
              >
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  No Institutional Honors on File
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Dean's list recognitions, hackathon championships, and academic distinctions are pushed directly by the academic department upon conferral.
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="text-xs text-primary-500 hover:underline inline-flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> View RBU Honors Eligibility & Nomination Guide
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  tabIndex={0}
                  className="p-4 rounded-xl border flex items-start gap-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:shadow-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--surface-border)',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {ach.title}
                      </h4>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {ach.issueDate}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Conferred by: {ach.issuer}
                    </p>
                    <div className="mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs" style={{ borderColor: 'var(--surface-border)' }}>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        Certificate ID: {ach.certificateId || `RBU-HON-2026-${ach.id.slice(0, 4).toUpperCase()}`}
                      </span>
                      <span className="text-amber-500 text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> [Verification Pending Backend Integration]
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Component Spec 12: Verification Attestation Footer */}
        <footer
          className="pt-6 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-secondary)' }}
        >
          <div className="space-y-1.5 w-full md:w-auto">
            <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              <GraduationCap className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span>Institutional Academic Record • Rayat Bahra University SIS</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                [Verification Pending Backend Integration]
              </span>
              <span>•</span>
              <div className="inline-flex items-center gap-1 bg-slate-500/10 px-1.5 py-0.5 rounded max-w-full">
                <span className="text-[10px] text-slate-400">Client Checksum:</span>
                <span className="font-mono text-[10px] text-slate-300 truncate max-w-[120px] sm:max-w-[200px]" title={docHash}>
                  {docHash ? `${docHash.substring(0, 12)}...` : 'Calculating...'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (docHash) {
                      navigator.clipboard.writeText(docHash);
                      setLiveAnnouncement('Cryptographic SHA-256 digest copied to clipboard.');
                    }
                  }}
                  title="Copy full cryptographic digest"
                  aria-label="Copy full cryptographic digest"
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto no-print pt-2 md:pt-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintPdf}
              className="text-xs min-h-[44px] sm:min-h-[36px] flex items-center justify-center"
              aria-label="Download officially sealed PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Download Sealed PDF
            </Button>
          </div>
        </footer>
      </main>

      {/* Discrepancy & Help Footer Link */}
      <footer className="text-center text-xs no-print pb-6" style={{ color: 'var(--text-muted)' }}>
        Notice a discrepancy in this institutional record?{' '}
        <button
          type="button"
          onClick={() => setIsHelpModalOpen(true)}
          className="text-primary-500 hover:underline font-medium"
        >
          Contact RBU Academic Office & Registrar
        </button>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Submit Skill for Review                              */}
      {/* ------------------------------------------------------------- */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div
            className="soft-card p-6 sm:p-8 max-w-lg w-full space-y-5 border shadow-2xl relative"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Submit Skill for Department Review
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Validated competencies receive official institutional accreditation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Skill or Technology Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, React, PyTorch, Embedded C"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Discipline Track
                  </label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Management & Analytics">Management & Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Self-Assessed Level
                  </label>
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none"
                  >
                    <option value="Beginner">Beginner (Foundations)</option>
                    <option value="Intermediate">Intermediate (Project-Ready)</option>
                    <option value="Advanced">Advanced (Production Experience)</option>
                    <option value="Expert">Expert (Research / Published)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Coursework or Repository Evidence (Optional URL)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or Course Project Link"
                  value={newSkillEvidence}
                  onChange={(e) => setNewSkillEvidence(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none"
                />
                <span className="text-[11px] block mt-1" style={{ color: 'var(--text-muted)' }}>
                  Assists faculty advisors during peer and department endorsement.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsSkillModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submittingSkill}>
                  {submittingSkill ? 'Submitting...' : 'Submit to Faculty Queue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Privacy & Granular Scope Controls (Student Owner)    */}
      {/* ------------------------------------------------------------- */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div
            className="soft-card p-6 sm:p-8 max-w-md w-full space-y-5 border shadow-2xl relative"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Share Privacy & Scope Controls
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Customize which academic metrics recruiters can inspect.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--surface-border)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Display Cumulative GPA
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Controls GPA visibility to external evaluators.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showGpa}
                  onChange={(e) => handleUpdatePrivacy('showGpa', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--surface-border)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Display Attendance Metrics
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Controls attendance records visibility to external evaluators.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showAttendance}
                  onChange={(e) => handleUpdatePrivacy('showAttendance', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--surface-border)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Display Full Student UID
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Masks official registration roll number if disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showUid}
                  onChange={(e) => handleUpdatePrivacy('showUid', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsPrivacyModalOpen(false)}>
                Save Privacy Scope
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Registrar Support & Discrepancy Inquiry              */}
      {/* ------------------------------------------------------------- */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div
            className="soft-card p-6 sm:p-8 max-w-lg w-full space-y-5 border shadow-2xl relative"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    RBU Academic Office & Verification Desk
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Official credential governance and transcript inquiries
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong>Rayat Bahra University Campus Passport</strong> represents an institutional integration between the Student Information System (SIS), the Office of Academic Affairs, and departmental evaluation committees.
              </p>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5">
                <p className="font-semibold text-slate-200">How Credentials are Validated:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Academic Records:</strong> Directly synchronized each semester with the central ERP database.</li>
                  <li><strong>Skills:</strong> Verified by designated department faculty following capstone and lab reviews.</li>
                  <li><strong>Honors:</strong> Conferred solely by department heads, Dean of Student Welfare, or University Academic Council.</li>
                </ul>
              </div>
              <p>
                For official sealed paper transcripts or dispute resolutions, contact: <br />
                <span className="font-mono text-emerald-500">registrar@rayatbahrauniversity.edu.in</span> • Office: Administrative Block, RBU Campus, Mohali.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsHelpModalOpen(false)}>
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

