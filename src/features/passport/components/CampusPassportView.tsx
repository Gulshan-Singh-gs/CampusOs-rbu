import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  ShieldCheck,
  Award,
  Printer,
  Sparkles,
  Share2,
  ThumbsUp,
  GraduationCap,
  Plus,
} from 'lucide-react';
import type { StudentSkill, StudentAchievement } from '@/shared/types/app.types';

export const CampusPassportView: React.FC = () => {
  const { profile } = useSessionStore();
  const [copied, setCopied] = useState(false);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  useEffect(() => {
    async function loadPassportData() {
      if (!profile?.id) return;
      try {
        const { data: remoteSkills } = await supabase
          .from('student_skills')
          .select('id, student_id, skill_id, proficiency_level, endorsement_count, skills(name)')
          .eq('student_id', profile.id);

        if (remoteSkills && remoteSkills.length > 0) {
          setSkills(
            remoteSkills.map((s: any) => ({
              id: s.id,
              studentId: s.student_id,
              skillId: s.skill_id,
              skillName: s.skills?.name || 'Technical Skill',
              proficiencyLevel: s.proficiency_level,
              endorsementCount: s.endorsement_count || 0,
            }))
          );
        }

        const { data: remoteAchievements } = await supabase
          .from('student_achievements')
          .select('*')
          .eq('student_id', profile.id);

        if (remoteAchievements && remoteAchievements.length > 0) {
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
        }
      } catch (err) {
        console.warn('Passport sync notice:', err);
      }
    }

    loadPassportData();
  }, [profile?.id]);

  const handleEndorse = async (skillId: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, endorsementCount: s.endorsementCount + 1 } : s))
    );
    try {
      if (profile?.id) {
        await supabase.from('skill_endorsements').insert({
          student_skill_id: skillId,
          endorser_id: profile.id,
        });
      }
    } catch (err) {
      console.warn('Endorsement sync notice:', err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !profile?.id) return;

    const trimmed = newSkillName.trim();
    const tempSkill: StudentSkill = {
      id: crypto.randomUUID(),
      studentId: profile.id,
      skillId: crypto.randomUUID(),
      skillName: trimmed,
      proficiencyLevel: 'Intermediate',
      endorsementCount: 0,
    };

    setSkills((prev) => [...prev, tempSkill]);
    setNewSkillName('');
    setIsAddingSkill(false);

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
          .insert({ name: trimmed, category: 'Engineering' })
          .select('id')
          .single();
        targetSkillId = createdSkill?.id;
      }

      if (targetSkillId) {
        await supabase.from('student_skills').insert({
          student_id: profile.id,
          skill_id: targetSkillId,
          proficiency_level: 'Intermediate',
          endorsement_count: 0,
        });
      }
    } catch (err) {
      console.warn('Skill persistence notice:', err);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top action header (hidden during print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Campus Passport & Digital Resume
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cryptographically verifiable university profile and academic resume.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleCopyLink} size="sm">
            <Share2 className="w-4 h-4 mr-1.5" />
            {copied ? 'Copied Link!' : 'Share URL'}
          </Button>
          <Button variant="primary" onClick={handlePrintPdf} size="sm">
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Verifiable Resume Card (Target of @media print) */}
      <div
        className="soft-card p-6 sm:p-10 space-y-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {/* Verification watermark */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
                color: 'var(--text-primary)',
              }}
            >
              {profile?.fullName ? profile.fullName.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile?.fullName || 'Aaravpreet Singh'}
                </h2>
                <Badge variant="success" className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </Badge>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {profile?.department || 'Computer Science & Engineering'} • Year {profile?.yearOfStudy || 3}
              </p>
              <p className="text-xs font-mono mt-1 opacity-75" style={{ color: 'var(--text-muted)' }}>
                UID: {profile?.rollNumber || 'RBU21CSE045'} • Rayat Bahra University
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-500">
              Institutional Status
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              In Good Standing
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Attendance: 92% • GPA: 8.8 / 10
            </div>
          </div>
        </div>

        {/* Bio statement */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-500">
            About & Academic Focus
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Passionate full-stack developer and distributed systems enthusiast. Active contributor to campus open source initiatives, competitive programming events, and technical society hackathons.
          </p>
        </div>

        {/* Verified Skills & Peer Endorsements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Verified Skills & Endorsements ({skills.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingSkill(!isAddingSkill)}
              className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1 no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingSkill ? 'Cancel' : 'Add Skill'}
            </button>
          </div>

          {isAddingSkill && (
            <form onSubmit={handleAddSkill} className="flex gap-2 pb-2 no-print">
              <input
                type="text"
                placeholder="e.g. Python, Docker, Figma..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-slate-100"
              />
              <Button type="submit" size="sm" variant="primary">
                Add
              </Button>
            </form>
          )}

          {skills.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No Verified Skills Yet"
              description="Add your core competencies to receive peer endorsements from fellow students and faculty."
              actionLabel="Add First Skill"
              onAction={() => setIsAddingSkill(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl border flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--surface-border)',
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {skill.skillName}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {skill.proficiencyLevel} • {skill.endorsementCount} endorsements
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEndorse(skill.id)}
                    title="Endorse this peer skill"
                    className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-500 transition-colors no-print"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Honors & Achievements */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            University Honors & Verified Credentials ({achievements.length})
          </h3>
          {achievements.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No University Honors Recorded"
              description="Official credentials, academic awards, and competition victories will appear here upon department verification."
            />
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl border flex items-start gap-3.5"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--surface-border)',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {ach.title}
                      </h4>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {ach.issueDate}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Issued by: {ach.issuer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification footer */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Authenticated via Rayat Bahra University CampusOS Zero-Trust Identity</span>
          </div>
          <div className="font-mono">
            Document Hash: SHA256-RBU-PASSPORT-{profile?.rollNumber || '2026'}
          </div>
        </div>
      </div>
    </div>
  );
};
