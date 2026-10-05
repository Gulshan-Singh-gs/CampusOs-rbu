import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  UserPlus,
  Sparkles,
  MessageSquare,
  Users,
} from 'lucide-react';
import type { Connection, ConnectionStatus, Profile } from '@/shared/types/app.types';

export const SocialGraphView: React.FC = () => {
  const { profile } = useSessionStore();
  const [filter, setFilter] = useState<'all' | 'connected' | 'pending'>('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [discoverableStudents, setDiscoverableStudents] = useState<Partial<Profile>[]>([]);

  useEffect(() => {
    async function loadSocialGraph() {
      if (!profile?.id) return;
      try {
        // 1. Fetch user connections
        const { data: remoteConnections } = await supabase
          .from('connections')
          .select('id, requester_id, recipient_id, status, created_at')
          .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`);

        if (remoteConnections && remoteConnections.length > 0) {
          setConnections(
            remoteConnections.map((c: any) => ({
              id: c.id,
              requesterId: c.requester_id,
              recipientId: c.recipient_id,
              status: c.status,
              createdAt: c.created_at,
            }))
          );
        } else {
          setConnections([]);
        }

        // 2. Fetch discoverable students from profiles
        const { data: remoteProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, department, year_of_study, role')
          .neq('id', profile.id)
          .limit(10);

        if (remoteProfiles && remoteProfiles.length > 0) {
          setDiscoverableStudents(
            remoteProfiles.map((p: any) => ({
              id: p.id,
              fullName: p.full_name,
              department: p.department,
              yearOfStudy: p.year_of_study,
              role: p.role,
            }))
          );
        } else {
          setDiscoverableStudents([]);
        }
      } catch (err) {
        console.warn('Social graph sync notice:', err);
      }
    }
    loadSocialGraph();
  }, [profile?.id]);

  const handleAccept = async (connId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connId ? { ...c, status: 'accepted' as ConnectionStatus } : c))
    );
    try {
      await supabase.from('connections').update({ status: 'accepted' }).eq('id', connId);
    } catch (err) {
      console.warn('Accept connection sync notice:', err);
    }
  };

  const handleConnect = async (peer: Partial<Profile>) => {
    if (!profile?.id || !peer.id) return;
    const newConn: Connection = {
      id: crypto.randomUUID(),
      requesterId: profile.id,
      recipientId: peer.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      peerProfile: peer,
    };
    setConnections((prev) => [...prev, newConn]);
    setDiscoverableStudents((prev) => prev.filter((s) => s.id !== peer.id));

    try {
      await supabase.from('connections').insert({
        id: newConn.id,
        requester_id: newConn.requesterId,
        recipient_id: newConn.recipientId,
        status: 'pending',
      });
    } catch (err) {
      console.warn('Connect peer sync notice:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Campus Social Graph & Peers
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Privacy-first academic networking with verified Rayat Bahra University students.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--surface-border)' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            filter === 'all'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          Active Connections ({connections.filter((c) => c.status === 'accepted').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            filter === 'pending'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          Pending Requests ({connections.filter((c) => c.status === 'pending').length})
        </button>
      </div>

      {/* Connection List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Your Peer Network ({connections.filter((c) => (filter === 'all' ? true : c.status === filter)).length})
        </h2>
        {connections.filter((c) => (filter === 'all' ? true : c.status === filter)).length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Connections in this Filter"
            description="You don't have any connections under this tab yet. Connect with batchmates below to build your campus network."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connections
              .filter((c) => (filter === 'all' ? true : c.status === filter))
              .map((conn) => (
                <div
                  key={conn.id}
                  className="soft-card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-base">
                      {conn.peerProfile?.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {conn.peerProfile?.fullName || 'Peer Student'}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {conn.peerProfile?.department || 'RBU'} • Year {conn.peerProfile?.yearOfStudy || 1}
                      </p>
                      <div className="mt-1">
                        {conn.status === 'accepted' ? (
                          <Badge variant="success" className="text-[10px]">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">
                            Request Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {conn.status === 'pending' ? (
                      <Button size="sm" variant="primary" onClick={() => handleAccept(conn.id)}>
                        Accept
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => (window.location.href = '/chat')}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Suggested Discoverable Peers */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-500" />
          Suggested Batchmates ({discoverableStudents.length})
        </h2>
        {discoverableStudents.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No Other Registered Peers Found"
            description="As more batchmates sign up and complete their onboarding, they will appear here for 1-tap connection requests."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {discoverableStudents.map((peer) => (
              <div
                key={peer.id}
                className="soft-card p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {peer.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {peer.fullName}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {peer.department} • Year {peer.yearOfStudy}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleConnect(peer)}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
