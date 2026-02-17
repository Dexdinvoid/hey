/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FeedPostCard } from "./feed-post-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // Ensure user is synced
  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) {
    const { syncUser } = await import("@/lib/auth-helpers");
    dbUser = await syncUser(authUser);
  }

  if (!dbUser) redirect("/login");

  const recentPosts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true, displayName: true, avatarUrl: true },
      },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 20,
        include: {
          user: {
            select: { username: true, displayName: true },
          },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-2">Your stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-purple-400">{dbUser.points}</p>
            <p className="text-sm text-white/60">Points</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dbUser.league}</p>
            <p className="text-sm text-white/60">League</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dbUser.currentStreak}</p>
            <p className="text-sm text-white/60">Current streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dbUser.longestStreak}</p>
            <p className="text-sm text-white/60">Longest streak</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Social feed</h2>
        {recentPosts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-white/10">
            <p className="text-white/70 mb-2">No posts yet.</p>
            <p className="text-sm text-white/50">
              Complete habits with image proof to see them here.
            </p>
            <Link
              href="/tracker"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
            >
              Go to Tracker
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {recentPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={authUser.id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

