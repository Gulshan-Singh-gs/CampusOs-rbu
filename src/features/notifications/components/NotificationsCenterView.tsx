import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  Bell,
  CheckCircle,
  Calendar,
  Users,
  MessageSquare,
  FileCheck2,
} from 'lucide-react';
import type { NotificationItem } from '@/shared/types/app.types';

export const NotificationsCenterView: React.FC = () => {
  const { profile } = useSessionStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!profile?.id) return;
      try {
        const { data: remoteNotifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', profile.id)
          .order('created_at', { ascending: false });

        if (remoteNotifications && remoteNotifications.length > 0) {
          setNotifications(
            remoteNotifications.map((n: any) => ({
              id: n.id,
              recipientId: n.recipient_id,
              title: n.title,
              body: n.body,
              category: n.category,
              linkUrl: n.link_url,
              isRead: n.is_read,
              createdAt: n.created_at,
            }))
          );
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.warn('Notifications sync notice:', err);
      }
    }
    loadNotifications();
  }, [profile?.id]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      if (profile?.id) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('recipient_id', profile.id);
      }
    } catch (err) {
      console.warn('Mark all read sync notice:', err);
    }
  };

  const getCategoryIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'rsvp':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'connection':
        return <Users className="w-4 h-4 text-primary-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'application':
        return <FileCheck2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Notifications Hub
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Authoritative university alerts, event updates, and peer activities.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={markAllAsRead}>
          <CheckCircle className="w-4 h-4 mr-1.5" />
          Mark all read
        </Button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications Yet"
            description="You are all caught up! Real-time alerts for RSVP tickets, society updates, and faculty endorsements will appear here."
          />
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`soft-card p-4 sm:p-5 flex items-start gap-4 transition-all ${
                item.isRead ? 'opacity-70' : 'border-primary-500/30 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 shrink-0">
                {getCategoryIcon(item.category)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
