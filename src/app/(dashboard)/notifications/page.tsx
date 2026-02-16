import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { NotificationsList } from "./notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: authUser.id, readAt: null },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm font-normal text-white/60">
              ({unreadCount} unread)
            </span>
          )}
        </h1>
        <Link
          href="/dashboard"
          className="text-sm text-white/60 hover:text-white"
        >
          Back to Home
        </Link>
      </div>
      <NotificationsList notifications={notifications} currentUserId={authUser.id} />
    </div>
  );
}
