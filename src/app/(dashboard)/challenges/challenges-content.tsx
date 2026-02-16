/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  generateChallenge,
  acceptChallenge,
  completeChallenge,
} from "@/app/actions/challenges";

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  createdAt: Date;
};

type UserChallenge = {
  id: string;
  status: string;
  progress: number;
  completedAt: Date | null;
  challenge: Challenge;
};

type LeaderUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  points: number;
  league: string;
};

export function ChallengesContent({
  recentChallenges,
  myChallenges,
  globalLeaderboard,
  friendsLeaderboard,
}: {
  recentChallenges: Challenge[];
  myChallenges: UserChallenge[];
  globalLeaderboard: LeaderUser[];
  friendsLeaderboard: LeaderUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"challenges" | "global" | "friends">(
    "challenges"
  );

  async function handleGenerate(type: "daily" | "weekly" | "monthly") {
    setGenerating(true);
    setError(null);
    const result = await generateChallenge(type);
    setGenerating(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  async function handleAccept(challengeId: string) {
    setError(null);
    const result = await acceptChallenge(challengeId);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  async function handleComplete(challengeId: string) {
    setError(null);
    const result = await completeChallenge(challengeId);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  function LeaderboardList({ users }: { users: LeaderUser[] }) {
    return (
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li
            key={u.id}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2"
          >
            <span className="text-white/50 w-6 text-sm">#{i + 1}</span>
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                {(u.displayName || u.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <Link
              href={`/profile/${u.username}`}
              className="flex-1 font-medium text-white hover:text-purple-300"
            >
              {u.displayName || u.username}
            </Link>
            <span className="text-white/70 text-sm">{u.points} pts</span>
            <span className="text-white/50 text-sm">{u.league}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Generate AI challenge</h2>
        <div className="flex gap-2 flex-wrap">
          {(["daily", "weekly", "monthly"] as const).map((type) => (
            <button
              key={type}
              type="button"
              disabled={generating}
              onClick={() => handleGenerate(type)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium capitalize"
            >
              {generating ? "…" : `Generate ${type}`}
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Recent challenges</h2>
        {recentChallenges.length === 0 ? (
          <p className="text-white/60 text-sm">Generate a challenge above.</p>
        ) : (
          <ul className="space-y-3">
            {recentChallenges.map((c) => {
              const my = myChallenges.find((uc) => uc.challenge.id === c.id);
              return (
                <li
                  key={c.id}
                  className="rounded-lg bg-white/5 border border-white/10 px-4 py-3"
                >
                  <p className="font-medium text-white">{c.title}</p>
                  <p className="text-sm text-white/70 mt-1">{c.description}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {c.type} · {c.points} pts
                  </p>
                  <div className="mt-2">
                    {!my ? (
                      <button
                        type="button"
                        onClick={() => handleAccept(c.id)}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm"
                      >
                        Accept challenge
                      </button>
                    ) : my.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => handleComplete(c.id)}
                        className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
                      >
                        Mark complete
                      </button>
                    ) : (
                      <span className="text-white/50 text-sm">Completed</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">My challenges</h2>
        {myChallenges.length === 0 ? (
          <p className="text-white/60 text-sm">Accept a challenge from the list above.</p>
        ) : (
          <ul className="space-y-2">
            {myChallenges.map((uc) => (
              <li
                key={uc.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-white font-medium">{uc.challenge.title}</span>
                <span className="text-white/50 text-sm">
                  {uc.status === "completed" ? "Done" : `${uc.progress}%`}
                </span>
                {uc.status === "active" && (
                  <button
                    type="button"
                    onClick={() => handleComplete(uc.challenge.id)}
                    className="px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-xs"
                  >
                    Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("global")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === "global"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/80 hover:text-white"
            }`}
          >
            Global leaderboard
          </button>
          <button
            type="button"
            onClick={() => setTab("friends")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === "friends"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/80 hover:text-white"
            }`}
          >
            Friends leaderboard
          </button>
        </div>
        {tab === "global" && <LeaderboardList users={globalLeaderboard} />}
        {tab === "friends" && (
          friendsLeaderboard.length === 0 ? (
            <p className="text-white/60 text-sm">Add friends to see their rankings.</p>
          ) : (
            <LeaderboardList users={friendsLeaderboard} />
          )
        )}
      </section>
    </div>
  );
}
