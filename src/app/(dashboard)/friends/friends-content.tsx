/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchUsers, sendFriendRequest, respondToFriendRequest } from "@/app/actions/friends";

type User = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  points?: number;
  league?: string;
};

type SearchResult = User & {
  isFriend: boolean;
  pendingSent: boolean;
  pendingRecv: boolean;
};

export function FriendsContent({
  friends,
  incomingRequests,
}: {
  currentUserId: string;
  friends: User[];
  incomingRequests: { id: string; sender: User }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    const res = await searchUsers(query);
    setResults(res.users ?? []);
    if (res.error && res.users?.length === 0) setError(res.error);
    setSearching(false);
  }

  async function handleSendRequest(username: string) {
    setError(null);
    const formData = new FormData();
    formData.set("username", username);
    const res = await sendFriendRequest(formData);
    if (res?.error) setError(res.error);
    else router.refresh();
    setResults((prev) =>
      prev.map((u) =>
        u.username === username ? { ...u, pendingSent: true } : u
      )
    );
  }

  async function handleRespond(requestId: string, accept: boolean) {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("accept", String(accept));
    await respondToFriendRequest(formData);
    router.refresh();
  }

  function UserAvatar({ user, size = "w-10 h-10" }: { user: { displayName: string | null; username: string; avatarUrl: string | null }; size?: string }) {
    return user.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt=""
        className={`${size} rounded-full object-cover border border-primary/30`}
      />
    ) : (
      <div className={`${size} rounded-full neon-gradient flex items-center justify-center text-navy-deep font-bold text-sm shrink-0`}>
        {(user.displayName || user.username).slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Leaderboard</h2>
      </div>

      {/* Search Section */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">search</span>
          <h3 className="text-lg font-bold text-white">Search Users</h3>
        </div>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username"
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 rounded-2xl neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {searching ? "…" : "Search"}
          </button>
        </form>
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        {results.length > 0 && (
          <ul className="mt-5 space-y-3">
            {results.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-2xl glass-panel px-4 py-3 border border-white/5 hover:border-primary/30 transition-all"
              >
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar user={u} />
                  <div>
                    <span className="text-sm font-bold text-white hover:text-primary transition-colors">
                      {u.displayName || u.username}
                    </span>
                    {u.points != null && (
                      <p className="text-xs text-slate-500">
                        {u.points} pts · {u.league}
                      </p>
                    )}
                  </div>
                </Link>
                <div>
                  {u.isFriend ? (
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Friends</span>
                  ) : u.pendingSent ? (
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request sent</span>
                  ) : u.pendingRecv ? (
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendRequest(u.username)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full neon-gradient text-navy-deep font-bold text-xs neon-glow hover:-translate-y-0.5 transition-all"
                    >
                      <span className="material-icons-round text-sm">person_add</span>
                      Add
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <section className="glass-card rounded-[2rem] p-7 border-primary/20">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-icons-round text-primary text-xl">group_add</span>
            <h3 className="text-lg font-bold text-white">Friend Requests</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
              {incomingRequests.length}
            </span>
          </div>
          <ul className="space-y-3">
            {incomingRequests.map(({ id, sender }) => (
              <li
                key={id}
                className="flex items-center justify-between rounded-2xl glass-panel px-4 py-3 border border-white/5 hover:border-primary/30 transition-all"
              >
                <Link
                  href={`/profile/${sender.username}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar user={sender} />
                  <span className="text-sm font-bold text-white">
                    {sender.displayName || sender.username}
                  </span>
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespond(id, true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full neon-gradient text-navy-deep font-bold text-xs neon-glow hover:-translate-y-0.5 transition-all"
                  >
                    <span className="material-icons-round text-sm">check</span>
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond(id, false)}
                    className="px-4 py-2 rounded-full glass-panel text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold border border-white/5 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Friends List */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">group</span>
          <h3 className="text-lg font-bold text-white">Your Friends</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-bold">
            {friends.length}
          </span>
        </div>
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons-round text-4xl text-primary/20 mb-3 block">person_search</span>
            <p className="text-slate-500 text-sm">No friends yet. Search and add someone above.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {friends.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-2xl glass-panel px-4 py-3 border border-white/5 hover:border-primary/30 transition-all"
              >
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar user={u} />
                  <div>
                    <span className="text-sm font-bold text-white">
                      {u.displayName || u.username}
                    </span>
                    {u.points != null && (
                      <p className="text-xs text-slate-500">
                        {u.points} pts · {u.league}
                      </p>
                    )}
                  </div>
                </Link>
                <Link
                  href={`/messages/${u.username}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-panel text-primary hover:bg-primary/10 hover:border-primary/30 text-xs font-bold border border-white/5 transition-all"
                >
                  <span className="material-icons-round text-sm">chat_bubble</span>
                  Message
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
