import React, { useState } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Send, Lock, Clock, MessageSquare, AlertCircle, RotateCcw, ShieldAlert } from 'lucide-react';

export const EphemeralChatView: React.FC = () => {
  const { profile } = useSessionStore();
  const roomId = 'room-solar-drone-project';
  const [inputVal, setInputVal] = useState('');
  const [reportModalUser, setReportModalUser] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    blockUser,
    reportMessage,
  } = useChat({
    conversationId: roomId,
    userId: profile?.id || profile?.rollNumber || 'RBU21CSE045',
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    const text = inputVal.trim();
    setInputVal('');
    try {
      await sendMessage({ content: text });
    } catch {
      // Input is preserved or rollback state displayed in message item
    }
  };

  const handleBlock = async (targetId: string) => {
    if (window.confirm('Are you sure you want to block this user from messaging you?')) {
      await blockUser(targetId, 'In-chat student block');
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalUser || !reportReason.trim()) return;
    await reportMessage(reportModalUser, 'msg-ref', reportReason.trim());
    setReportSuccess(true);
    setTimeout(() => {
      setReportModalUser(null);
      setReportReason('');
      setReportSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Room Header */}
      <div className="soft-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Project Match: Solar Autonomous Drone
            </h2>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Institutional Chat Room • Configurable 14-day Retention
            </p>
          </div>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          RLS Verified Session
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Message Window */}
      <div
        className="soft-card p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 flex flex-col justify-end"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-400">
            Connecting to secure room channel...
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Encrypted Squad Room Ready"
            description="No messages yet in this collaboration room. Say hello to begin coordinating with your squad."
          />
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const currentUid = profile?.id || profile?.rollNumber || 'RBU21CSE045';
              const isMe = msg.senderId === currentUid;
              const isFailed = msg.status === 'failed';
              const isPending = msg.status === 'sending';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {msg.senderName || 'Student'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleBlock(msg.senderId)}
                          className="text-[10px] text-slate-400 hover:text-rose-400"
                          title="Block User"
                        >
                          Block
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => setReportModalUser(msg.senderId)}
                          className="text-[10px] text-slate-400 hover:text-amber-400"
                          title="Report Message"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm transition-all ${
                      isMe
                        ? isFailed
                          ? 'bg-rose-950/80 text-rose-200 border border-rose-800 rounded-br-none'
                          : isPending
                          ? 'bg-primary-600/70 text-white/80 rounded-br-none italic'
                          : 'bg-primary-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    {msg.content}
                    {isFailed && (
                      <div className="mt-1 pt-1 border-t border-rose-800/60 flex items-center gap-1.5 text-[10px] text-rose-300">
                        <RotateCcw className="w-3 h-3" />
                        <span>Delivery failed. Try resending.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type a message to project squad..."
          disabled={isSending}
          className="flex-1 px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--surface-border)',
            color: 'var(--text-primary)',
          }}
        />
        <Button type="submit" variant="primary" size="md" disabled={isSending || !inputVal.trim()}>
          <Send className="w-4 h-4 mr-1.5" />
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </form>

      {/* Moderation Report Dialog */}
      {reportModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldAlert className="w-5 h-5" />
              <h3>Report Inappropriate Conduct</h3>
            </div>
            <p className="text-xs text-slate-400">
              Submit an institutional report to the Dean of Students Welfare (DSW).
            </p>
            {reportSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center">
                Report logged successfully. Incident ticket created.
              </div>
            ) : (
              <form onSubmit={submitReport} className="space-y-3">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe the violation or misconduct..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setReportModalUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
