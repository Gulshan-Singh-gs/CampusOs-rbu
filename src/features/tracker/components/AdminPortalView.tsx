import React, { useState, useEffect } from 'react';
import { useCampusStore } from '@/services/api/dataStore';
import { StatusBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Toast, ToastProps } from '@/shared/ui/Toast';
import { supabase } from '@/shared/lib/supabase';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileText,
  UserCheck,
  Building,
  Sparkles,
  FolderKanban,
} from 'lucide-react';
import type { ApplicationStatus } from '@/shared/types/app.types';
import { recordAuditLog } from '@/services/api/auditService';

export const AdminPortalView: React.FC = () => {
  const { applications } = useCampusStore();
  const [activeTab, setActiveTab] = useState<'applications' | 'competencies'>('applications');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

  // Faculty Competency Endorsement Queue
  const [facultySkills, setFacultySkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    async function loadSkillsQueue() {
      setLoadingSkills(true);
      try {
        const { data } = await supabase
          .from('student_skills')
          .select('id, student_id, skill_id, proficiency_level, endorsement_count, skills(name), profiles(full_name, roll_number, department)')
          .limit(20);
        if (data) {
          setFacultySkills(data);
        }
      } catch (err) {
        console.warn('Faculty skills queue fetch:', err);
      } finally {
        setLoadingSkills(false);
      }
    }
    loadSkillsQueue();
  }, []);

  // Filter applications
  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'Pending Review').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const handleUpdateStatus = async (appId: string, title: string, newStatus: ApplicationStatus) => {
    // 1. Optimistically update local application roster
    const updated = applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
    useCampusStore.setState({ applications: updated });
    localStorage.setItem('campusos_submitted_applications', JSON.stringify(updated));

    // 2. Record immutable audit event for administrative endorsement
    recordAuditLog(
      newStatus === 'Approved' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
      'document_application',
      appId,
      { title, newStatus }
    );

    // 3. Persist to Supabase backend
    try {
      await supabase
        .from('document_applications')
        .update({ status: newStatus })
        .eq('id', appId);
    } catch (e) {
      console.warn('Status update Supabase persistence note:', e);
    }

    setToast({
      type: newStatus === 'Approved' ? 'success' : 'error',
      title: `Application ${newStatus}`,
      message: `"${title}" is now marked as ${newStatus}. Letterhead endorsements updated.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* 1. Header with Authority Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Dean & Faculty Review Portal
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Authority endorsement panel: Dean of Student Welfare (DSW), HODs, and Committee
            Officers.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--surface-border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'applications' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <FolderKanban className="w-4 h-4" />
          Document Memorandums ({applications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('competencies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'competencies'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'competencies' ? 'var(--primary-color, #3b82f6)' : 'var(--card-bg)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Sparkles className="w-4 h-4" />
          Faculty Skill Endorsement Queue ({facultySkills.length})
        </button>
      </div>

      {activeTab === 'applications' ? (
        <>
          {/* 2. Key Metrics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setFilterStatus('Pending Review')}
              className={`soft-card p-5 cursor-pointer transition-all ${
                filterStatus === 'Pending Review' ? 'ring-2 ring-amber-500' : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Pending Review
                </span>
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {pendingCount}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Applications awaiting endorsement
              </p>
            </div>

            <div
              onClick={() => setFilterStatus('Approved')}
              className={`soft-card p-5 cursor-pointer transition-all ${
                filterStatus === 'Approved' ? 'ring-2 ring-emerald-500' : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Approved
                </span>
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {approvedCount}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Endorsed & granted certificates
              </p>
            </div>

            <div
              onClick={() => setFilterStatus('Rejected')}
              className={`soft-card p-5 cursor-pointer transition-all ${
                filterStatus === 'Rejected' ? 'ring-2 ring-red-500' : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Rejected
                </span>
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {rejectedCount}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Declined or returned requests
              </p>
            </div>
          </div>

          {/* 3. Review Queue List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <h3
                  className="text-xs font-bold uppercase tracking-[0.14em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  REVIEW QUEUE ({filteredApps.length})
                </h3>
              </div>
              {filterStatus !== 'All' && (
                <button
                  onClick={() => setFilterStatus('All')}
                  className="text-xs font-medium text-emerald-500 hover:underline"
                >
                  View all ({applications.length})
                </button>
              )}
            </div>

            {filteredApps.length === 0 ? (
              <div
                className="soft-card p-12 text-center space-y-3"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  No applications in this category
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  All student memorandums in this filter have been processed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="soft-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {app.trackingRef}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {app.createdDate}
                        </span>
                        <StatusBadge status={app.status} />
                      </div>

                      <div>
                        <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                          {app.title}
                        </h4>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Target Authority: <span className="font-medium">{app.targetAuthority}</span>
                        </p>
                      </div>

                      <div
                        className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs pt-2 border-t"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-secondary)' }}
                      >
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 opacity-60" />
                          {app.studentName} ({app.rollNumber})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 opacity-60" />
                          Dept of {app.department}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 opacity-60" />
                          Type: {app.docType.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Authority Action Endorsements */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(app.id, app.title, 'Rejected')}
                        className="text-xs hover:border-red-500 hover:text-red-500"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(app.id, app.title, 'Approved')}
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Approve & Endorse
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Faculty Skill Endorsement Queue */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3
              className="text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              PENDING STUDENT SKILL ENDORSEMENTS ({facultySkills.length})
            </h3>
          </div>

          {loadingSkills ? (
            <div className="p-12 text-center text-xs opacity-60">Loading department skill submissions...</div>
          ) : facultySkills.length === 0 ? (
            <div
              className="soft-card p-12 text-center space-y-3 border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
            >
              <Sparkles className="w-8 h-8 mx-auto text-primary-500" />
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                No Pending Skill Submissions
              </p>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                When students submit course competencies for capstone accreditation, they appear here for instructor endorsement.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {facultySkills.map((sk) => (
                <div
                  key={sk.id}
                  className="soft-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--surface-border)' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {sk.skills?.name || 'Technical Competency'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                        {sk.proficiency_level}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Student: <strong>{sk.profiles?.full_name || 'Registered Student'}</strong> ({sk.profiles?.roll_number || 'UID'}) • Dept: {sk.profiles?.department || 'CSE'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={async () => {
                      setFacultySkills((prev) => prev.filter((item) => item.id !== sk.id));
                      try {
                        await supabase
                          .from('student_skills')
                          .update({ endorsement_count: (sk.endorsement_count || 0) + 1 })
                          .eq('id', sk.id);
                      } catch {
                        // ignore
                      }
                      setToast({
                        type: 'success',
                        title: 'Faculty Endorsement Confirmed',
                        message: `Endorsed ${sk.skills?.name || 'skill'} for ${sk.profiles?.full_name || 'student'}. Added to verified Passport ledger.`,
                      });
                    }}
                    className="text-xs shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Sign & Endorse Skill
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};
