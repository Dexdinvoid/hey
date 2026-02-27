"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

type Notification = {
  id: string;
  type: string;
  payload: string | null;
  readAt: Date | null;
  createdAt: Date;
};

const typeConfig: Record<string, { icon: string; label: string; href: string }> = {
  friend_request: { icon: "person_add", label: "Friend request", href: "/friends" },
  like: { icon: "favorite", label: "Someone liked your post", href: "/dashboard" },
  comment: { icon: "chat_bubble", label: "New comment on your post", href: "/dashboard" },
  challenge: { icon: "emoji_events", label: "Challenge update", href: "/challenges" },
  achievement: { icon: "military_tech", label: "Achievement unlocked!", href: "/dashboard" },
  follow: { icon: "person_add", label: "New follower", href: "/dashboard" },
};

export function NotificationsList({
  notifications,
}: {
  notifications: Notification[];
  currentUserId: string;
  unreadCount?: number;
  unreadByType?: Record<string, number>;
  activeChallenges?: { id: string; title: string; progress: number }[];
  topUsers?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; points: number }[];
}) {
  const router = useRouter();

  async function markRead(id: string) {
    await markNotificationRead(id);
    router.refresh();
  }

  async function markAllRead() {
    await markAllNotificationsRead();
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <div className="glass-card rounded-[2rem] p-10 text-center border-primary/20">
        <span className="material-icons-round text-5xl text-primary/30 mb-4 block">
          notifications_none
        </span>
        <p className="text-white/70 font-medium">No notifications yet.</p>
        <p className="text-sm text-slate-500 mt-1">
          When something happens, you&apos;ll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Notifications</h2>
        <button
          type="button"
          onClick={markAllRead}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all"
        >
          <span className="material-icons-round text-lg">done_all</span>
          Mark all read
        </button>
      </div>

      {/* Notification Items */}
      <ul className="space-y-3">
        {notifications.map((n) => {
          const unread = !n.readAt;
          const config = typeConfig[n.type] || { icon: "circle_notifications", label: n.type, href: "/dashboard" };

          return (
            <li
              key={n.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 ${unread
                  ? "border-primary/30 bg-primary/5"
                  : "border-white/5"
                }`}
            >
              <Link
                href={config.href}
                onClick={() => unread && markRead(n.id)}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${unread
                    ? "neon-gradient text-navy-deep neon-glow"
                    : "bg-white/5 text-slate-500"
                  }`}>
                  <span className="material-icons-round text-xl">{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${unread ? "text-white" : "text-slate-400"}`}>
                    {config.label}
                  </span>
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
                {unread && (
                  <div className="w-2 h-2 rounded-full bg-primary neon-glow shrink-0" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
