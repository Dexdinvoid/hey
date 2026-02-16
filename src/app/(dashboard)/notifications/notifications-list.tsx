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

export function NotificationsList({
  notifications,
}: {
  notifications: Notification[];
  currentUserId: string;
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
      <div className="glass rounded-2xl p-8 text-center border border-white/10">
        <p className="text-white/60">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Mark all read
        </button>
      </div>
      <ul className="space-y-1">
        {notifications.map((n) => {
          const unread = !n.readAt;
          let label = "";
          let href = "/dashboard";
          try {
            if (n.type === "friend_request") {
              label = "Friend request";
              href = "/friends";
            } else if (n.type === "like") {
              label = "Someone liked your post";
              href = "/dashboard";
            } else if (n.type === "comment") {
              label = "New comment on your post";
              href = "/dashboard";
            } else {
              label = n.type;
            }
          } catch {
            label = n.type;
          }
          return (
            <li
              key={n.id}
              className={`rounded-lg border px-4 py-3 ${
                unread
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <Link
                href={href}
                onClick={() => unread && markRead(n.id)}
                className="flex items-center justify-between"
              >
                <span className="text-white text-sm">{label}</span>
                <span className="text-white/50 text-xs">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
