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

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Search users</h2>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username"
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50"
          >
            {searching ? "…" : "Search"}
          </button>
        </form>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        {results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3"
                >
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
                  <span className="text-white font-medium">
                    {u.displayName || u.username}
                  </span>
                  {u.points != null && (
                    <span className="text-white/50 text-sm">
                      {u.points} pts · {u.league}
                    </span>
                  )}
                </Link>
                <div>
                  {u.isFriend ? (
                    <span className="text-white/50 text-sm">Friends</span>
                  ) : u.pendingSent ? (
                    <span className="text-white/50 text-sm">Request sent</span>
                  ) : u.pendingRecv ? (
                    <span className="text-white/50 text-sm">Pending</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendRequest(u.username)}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm"
                    >
                      Add friend
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {incomingRequests.length > 0 && (
        <section className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-medium text-white mb-4">
            Friend requests
          </h2>
          <ul className="space-y-3">
            {incomingRequests.map(({ id, sender }) => (
              <li
                key={id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <Link
                  href={`/profile/${sender.username}`}
                  className="flex items-center gap-3"
                >
                  {sender.avatarUrl ? (
                    <img
                      src={sender.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                      {(sender.displayName || sender.username)
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="text-white font-medium">
                    {sender.displayName || sender.username}
                  </span>
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespond(id, true)}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond(id, false)}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Your friends</h2>
        {friends.length === 0 ? (
          <p className="text-white/60 text-sm">No friends yet. Search and add someone.</p>
        ) : (
          <ul className="space-y-3">
            {friends.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3"
                >
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                      {(u.displayName || u.username)
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="text-white font-medium">
                    {u.displayName || u.username}
                  </span>
                  {u.points != null && (
                    <span className="text-white/50 text-sm">
                      {u.points} pts · {u.league}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/messages/${u.username}`}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
                >
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
