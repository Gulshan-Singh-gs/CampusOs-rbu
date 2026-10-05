import React, { useEffect } from 'react';
import { useCampusStore } from '@/services/api/dataStore';
import { StatusBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Printer, ArrowUpRight, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApplicationsTrackerView: React.FC = () => {
  const navigate = useNavigate();
  const { applications, fetchFromSupabase } = useCampusStore();

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Application Status Tracker
          </h1>
          <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
            Real-time status of your university memorandums, NOCs, and financial requests.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => navigate('/wizard')}>
          New Application
          <ArrowUpRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* 2. Applications Roster */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div
            className="soft-card p-12 text-center space-y-4 max-w-xl mx-auto"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <Inbox className="w-7 h-7" style={{ color: 'var(--text-muted)' }} strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                No applications submitted yet
              </p>
              <p className="text-xs max-w-xs mx-auto mt-1" style={{ color: 'var(--text-muted)' }}>
                Generate an official venue slip, examination NOC, or grant request using the Document
                Wizard.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/wizard')}>
              Open Document Wizard
            </Button>
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="soft-card p-6 space-y-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {app.trackingRef}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Submitted on {app.createdDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {app.title}
                  </h3>
                </div>

                <StatusBadge status={app.status} />
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 border-t"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-secondary)' }}
              >
                <div>
                  <span className="opacity-60">Addressed To:</span>{' '}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {app.targetAuthority}
                  </span>
                </div>
                <div>
                  <span className="opacity-60">Applicant:</span>{' '}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {app.studentName} ({app.rollNumber})
                  </span>
                </div>
                <div>
                  <span className="opacity-60">Department:</span>{' '}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {app.department}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/wizard')}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  View Letterhead & Print
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
