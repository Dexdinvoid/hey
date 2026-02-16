import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChallengesContent } from "./challenges-content";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const [recentChallenges, myChallenges, globalTop, friendIds] = await Promise.all([
    prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.userChallenge.findMany({
      where: { userId: authUser.id },
      include: { challenge: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 20,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        points: true,
        league: true,
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: authUser.id }, { user2Id: authUser.id }],
      },
      select: { user1Id: true, user2Id: true },
    }),
  ]);

  const friendIdSet = new Set(
    friendIds.flatMap((f: { user1Id: string; user2Id: string }) =>
      f.user1Id === authUser.id ? [f.user2Id] : [f.user1Id]
    )
  );
  const friendsTop = globalTop.filter((u) => friendIdSet.has(u.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Challenges</h1>
        <Link
          href="/dashboard"
          className="text-sm text-white/60 hover:text-white"
        >
          Back to Home
        </Link>
      </div>

      <ChallengesContent
        recentChallenges={recentChallenges}
        myChallenges={myChallenges}
        globalLeaderboard={globalTop}
        friendsLeaderboard={friendsTop}
        currentUserId={authUser.id}
      />
    </div>
  );
}
