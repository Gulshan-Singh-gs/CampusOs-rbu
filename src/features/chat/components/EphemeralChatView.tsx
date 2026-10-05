import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Send, Lock, Clock, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/shared/types/app.types';

export const EphemeralChatView: React.FC = () => {
  const { profile } = useSessionStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const roomId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    async function loadChatMessages() {
      try {
        const { data: remoteMsgs } = await supabase
          .from('chat_messages')
          .select('id, room_id, sender_id, content, created_at, profiles(full_name)')
          .order('created_at', { ascending: true })
          .limit(50);

        if (remoteMsgs && remoteMsgs.length > 0) {
          setMessages(
            remoteMsgs.map((m: any) => ({
              id: m.id,
              roomId: m.room_id,
              senderId: m.sender_id,
              senderName: m.profiles?.full_name || 'Collaborator',
              content: m.content,
              createdAt: m.created_at,
            }))
          );
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.warn('Chat messages sync notice:', err);
      }
    }
    loadChatMessages();
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !profile?.id) return;

    const trimmed = inputVal.trim();
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      roomId,
      senderId: profile.id,
      senderName: profile.fullName || 'Anonymous Student',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    try {
      await supabase.from('chat_messages').insert({
        id: newMsg.id,
        room_id: roomId,
        sender_id: profile.id,
        content: trimmed,
      });
    } catch (err) {
      console.warn('Chat message persistence notice:', err);
    }
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
              Ephemeral Room • Auto-expires in 14 days
            </p>
          </div>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          RLS Encrypted Session
        </div>
      </div>

      {/* Message Window */}
      <div
        className="soft-card p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 flex flex-col justify-end"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Encrypted Squad Room Ready"
            description="No messages yet in this collaboration room. Say hello to begin coordinating with your squad."
          />
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === (profile?.id || 'demo');
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type a message to project squad..."
          className="flex-1 px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--surface-border)',
            color: 'var(--text-primary)',
          }}
        />
        <Button type="submit" variant="primary" size="md">
          <Send className="w-4 h-4 mr-1.5" />
          Send
        </Button>
      </form>
    </div>
  );
};
