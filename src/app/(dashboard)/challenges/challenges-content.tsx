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
      <ul className="space-y-3">
        {users.map((u, i) => (
          <li
            key={u.id}
            className="flex items-center gap-4 rounded-2xl glass-panel px-4 py-3 border border-white/5 hover:border-primary/30 transition-all"
          >
            <span className={`text-sm font-black w-6 ${i < 3 ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "text-slate-500"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full neon-gradient flex items-center justify-center text-navy-deep font-bold text-sm">
                {(u.displayName || u.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <Link
              href={`/profile/${u.username}`}
              className="flex-1 font-bold text-sm text-white hover:text-primary transition-colors"
            >
              {u.displayName || u.username}
            </Link>
            <span className="text-xs font-bold text-primary">{u.points} XP</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{u.league}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Explore</h2>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-4 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span className="material-icons-round text-base">error</span>
            {error}
          </p>
        </div>
      )}

      {/* Generate Challenge */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">auto_awesome</span>
          <h3 className="text-lg font-bold text-white">Generate AI Challenge</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          {(["daily", "weekly", "monthly"] as const).map((type) => (
            <button
              key={type}
              type="button"
              disabled={generating}
              onClick={() => handleGenerate(type)}
              className="px-6 py-3 rounded-2xl neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all disabled:opacity-50 capitalize"
            >
              {generating ? "…" : `Generate ${type}`}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Challenges */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">bolt</span>
          <h3 className="text-lg font-bold text-white">Recent Challenges</h3>
        </div>
        {recentChallenges.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons-round text-4xl text-primary/20 mb-3 block">sports_score</span>
            <p className="text-slate-500 text-sm">Generate a challenge above to get started.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {recentChallenges.map((c) => {
              const my = myChallenges.find((uc) => uc.challenge.id === c.id);
              return (
                <li
                  key={c.id}
                  className="rounded-2xl glass-panel px-5 py-4 border border-white/5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{c.title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{c.type}</span>
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500 font-medium">{c.points} pts</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!my ? (
                        <button
                          type="button"
                          onClick={() => handleAccept(c.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full neon-gradient text-navy-deep font-bold text-xs neon-glow hover:-translate-y-0.5 transition-all"
                        >
                          <span className="material-icons-round text-sm">add_circle</span>
                          Accept
                        </button>
                      ) : my.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleComplete(c.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-xs hover:bg-green-500/30 transition-all"
                        >
                          <span className="material-icons-round text-sm">check_circle</span>
                          Complete
                        </button>
                      ) : (
                        <span className="text-[10px] text-primary font-black uppercase tracking-tighter">Completed</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* My Challenges */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">flag</span>
          <h3 className="text-lg font-bold text-white">My Challenges</h3>
        </div>
        {myChallenges.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons-round text-4xl text-primary/20 mb-3 block">emoji_events</span>
            <p className="text-slate-500 text-sm">Accept a challenge from the list above.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {myChallenges.map((uc) => (
              <li
                key={uc.id}
                className="flex items-center justify-between rounded-2xl glass-panel px-4 py-3 border border-white/5 hover:border-primary/30 transition-all"
              >
                <span className="text-sm font-bold text-white">{uc.challenge.title}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${uc.status === "completed" ? "text-primary" : "text-slate-400"}`}>
                    {uc.status === "completed" ? "Done" : `${uc.progress}%`}
                  </span>
                  {uc.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleComplete(uc.challenge.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-[10px] hover:bg-green-500/30 transition-all"
                    >
                      <span className="material-icons-round text-xs">check</span>
                      Complete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Leaderboard */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">leaderboard</span>
          <h3 className="text-lg font-bold text-white">Leaderboard</h3>
        </div>
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab("global")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${tab === "global"
                ? "bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                : "glass-panel text-slate-400 hover:text-primary hover:bg-primary/5 border border-white/5"
              }`}
          >
            Global
          </button>
          <button
            type="button"
            onClick={() => setTab("friends")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${tab === "friends"
                ? "bg-primary/10 border border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                : "glass-panel text-slate-400 hover:text-primary hover:bg-primary/5 border border-white/5"
              }`}
          >
            Friends
          </button>
        </div>
        {tab === "global" && <LeaderboardList users={globalLeaderboard} />}
        {tab === "friends" && (
          friendsLeaderboard.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">Add friends to see their rankings.</p>
            </div>
          ) : (
            <LeaderboardList users={friendsLeaderboard} />
          )
        )}
      </section>
    </div>
  );
}
