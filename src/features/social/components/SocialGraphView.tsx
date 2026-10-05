import React, { useState } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  UserPlus,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import type { Connection, ConnectionStatus, Profile } from '@/shared/types/app.types';

export const SocialGraphView: React.FC = () => {
  const { profile } = useSessionStore();
  const [filter, setFilter] = useState<'all' | 'connected' | 'pending'>('all');

  // Local state for connections & peer students
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'c1',
      requesterId: profile?.id || 'demo',
      recipientId: 'peer1',
      status: 'accepted',
      createdAt: new Date().toISOString(),
      peerProfile: {
        id: 'peer1',
        fullName: 'Mehak Sharma',
        department: 'CSE',
        yearOfStudy: 3,
        role: 'student',
      },
    },
    {
      id: 'c2',
      requesterId: 'peer2',
      recipientId: profile?.id || 'demo',
      status: 'pending',
      createdAt: new Date().toISOString(),
      peerProfile: {
        id: 'peer2',
        fullName: 'Rohan Varma',
        department: 'ECE',
        yearOfStudy: 2,
        role: 'student',
      },
    },
  ]);

  const [discoverableStudents, setDiscoverableStudents] = useState<Partial<Profile>[]>([
    {
      id: 'disc1',
      fullName: 'Ananya Deshmukh',
      department: 'IT',
      yearOfStudy: 3,
      role: 'student',
    },
    {
      id: 'disc2',
      fullName: 'Vikramjit Singh',
      department: 'ME',
      yearOfStudy: 4,
      role: 'student',
    },
  ]);

  const handleAccept = (connId: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === connId ? { ...c, status: 'accepted' as ConnectionStatus } : c))
    );
  };

  const handleConnect = (peer: Partial<Profile>) => {
    const newConn: Connection = {
      id: crypto.randomUUID(),
      requesterId: profile?.id || 'demo',
      recipientId: peer.id || 'unknown',
      status: 'pending',
      createdAt: new Date().toISOString(),
      peerProfile: peer,
    };
    setConnections((prev) => [...prev, newConn]);
    setDiscoverableStudents((prev) => prev.filter((s) => s.id !== peer.id));
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
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary-500/10 text-primary-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Connections ({connections.filter((c) => c.status === 'accepted').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-primary-500/10 text-primary-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Requests ({connections.filter((c) => c.status === 'pending').length})
        </button>
      </div>

      {/* Connection List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Your Peer Network
        </h2>
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
                      {conn.peerProfile?.fullName}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {conn.peerProfile?.department} • Year {conn.peerProfile?.yearOfStudy}
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
      </div>

      {/* Suggested Discoverable Peers */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-500" />
          Suggested Batchmates
        </h2>
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
      </div>
    </div>
  );
};
