import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
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

  // Count by type for sidebar badges
  const unreadByType = {
    all: unreadCount,
    friend_request: 0,
    like: 0,
    comment: 0,
    challenge: 0,
    achievement: 0,
    follow: 0,
  };

  const unreadNotifs = notifications.filter((n) => !n.readAt);
  for (const n of unreadNotifs) {
    const t = n.type as keyof typeof unreadByType;
    if (t in unreadByType) unreadByType[t]++;
  }

  // Get active challenges for the right panel
  const activeChallenges = await prisma.userChallenge.findMany({
    where: { userId: authUser.id, status: "active" },
    include: { challenge: true },
    take: 3,
  });

  // Get top performers for right panel
  const topUsers = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 3,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      points: true,
    },
  });

  return (
    <NotificationsList
      notifications={notifications}
      currentUserId={authUser.id}
      unreadCount={unreadCount}
      unreadByType={unreadByType}
      activeChallenges={activeChallenges.map((uc) => ({
        id: uc.id,
        title: uc.challenge.title,
        progress: uc.progress,
      }))}
      topUsers={topUsers}
    />
  );
}
