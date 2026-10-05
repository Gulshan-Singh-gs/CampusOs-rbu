import React, { useState } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { Button } from '@/shared/ui/Button';
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      recipientId: profile?.id || 'demo',
      title: 'RSVP Confirmed: Annual Hackathon 2026',
      body: 'Your attendance QR ticket has been generated. Show it at Turing Hall entry.',
      category: 'rsvp',
      linkUrl: '/events',
      isRead: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'n2',
      recipientId: profile?.id || 'demo',
      title: 'New Connection Request',
      body: 'Rohan Varma (ECE, Year 2) sent you a connection request.',
      category: 'connection',
      linkUrl: '/peers',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'n3',
      recipientId: profile?.id || 'demo',
      title: 'Application Status Update',
      body: 'Your NOC application for Inter-University Tech Fest has been Approved by HOD.',
      category: 'application',
      linkUrl: '/applications',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        {notifications.map((item) => (
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
        ))}
      </div>
    </div>
  );
};
