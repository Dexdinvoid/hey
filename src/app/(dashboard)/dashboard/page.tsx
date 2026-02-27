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
            select: { username: true, displayName: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Feed</h2>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-primary/10 transition-colors text-slate-400 hover:text-primary">
            <span className="material-icons-round text-xl">filter_list</span>
          </button>
          <button className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-primary/10 transition-colors text-slate-400 hover:text-primary">
            <span className="material-icons-round text-xl">search</span>
          </button>
        </div>
      </div>

      {/* Stories Row */}
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all group">
            <span className="material-icons-round text-primary/60 group-hover:text-primary">add</span>
          </div>
          <span className="text-xs font-medium text-slate-500">Your Story</span>
        </div>
        {/* Example story placeholders */}
        {["A", "S", "M"].map((letter, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group">
            <div className="w-16 h-16 rounded-full p-[2px] neon-gradient neon-glow">
              <div className="w-full h-full rounded-full bg-navy-deep flex items-center justify-center border-2 border-navy-deep">
                <span className="text-primary font-bold text-lg">{letter}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-primary transition-colors">
              {["James", "Sarah", "Mike"][i]}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Card */}
      <div className="glass-card rounded-[2rem] p-6 border-primary/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              {dbUser.points}
            </p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{dbUser.league}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">League</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{dbUser.currentStreak}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{dbUser.longestStreak}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Best</p>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <section>
        {recentPosts.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-10 text-center border-primary/20">
            <span className="material-icons-round text-5xl text-primary/30 mb-4 block">
              photo_camera
            </span>
            <p className="text-white/70 mb-2 font-medium">No posts yet.</p>
            <p className="text-sm text-slate-500 mb-6">
              Complete habits with image proof to see them here.
            </p>
            <Link
              href="/tracker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all"
            >
              <span className="material-icons-round text-lg">add_circle</span>
              Go to Tracker
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={authUser.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
