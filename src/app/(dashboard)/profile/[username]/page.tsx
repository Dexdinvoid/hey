/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10 flex items-center gap-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-16 h-16 rounded-full border border-white/20"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-medium">
            {(user.displayName || user.username).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-white">
            {user.displayName || user.username}
          </h1>
          <p className="text-white/60">@{user.username}</p>
          {user.bio && (
            <p className="text-white/80 mt-1 text-sm">{user.bio}</p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-white/70">
            <span>{user.points} points</span>
            <span>{user.league}</span>
            <span>Streak: {user.currentStreak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
