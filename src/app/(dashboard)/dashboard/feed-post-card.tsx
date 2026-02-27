/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleLike, addComment } from "@/app/actions/feed";

export type Post = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: Date;
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    body: string;
    createdAt: Date;
    user: { username: string; displayName: string | null; avatarUrl?: string | null };
  }[];
  _count: { likes: number; comments: number };
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function FeedPostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const router = useRouter();
  const liked = post.likes.some((l) => l.userId === currentUserId);
  const [showComments, setShowComments] = useState(false);

  async function handleLike() {
    await toggleLike(post.id);
    router.refresh();
  }

  async function handleComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("postId", post.id);
    await addComment(formData);
    form.reset();
    router.refresh();
  }

  return (
    <article className="glass-card rounded-[2.5rem] overflow-hidden group hover:border-primary/40 transition-all duration-500">
      <div className={`flex flex-col ${showComments ? "md:flex-row" : ""}`}>
        {/* Main Post Content */}
        <div className={`flex-1 p-6 lg:p-8 flex flex-col ${showComments ? "border-r border-white/5" : ""}`}>
          {/* Post Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                {post.user.avatarUrl ? (
                  <img
                    src={post.user.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full neon-gradient flex items-center justify-center text-navy-deep font-bold">
                    {(post.user.displayName || post.user.username)
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-navy-deep" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${post.user.username}`}
                    className="font-bold text-white text-base hover:text-primary transition-colors"
                  >
                    {post.user.displayName || post.user.username}
                  </Link>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    • {timeAgo(post.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                  <span className="material-icons-round text-sm">local_fire_department</span>
                  <span>Habit Completed</span>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <span className="material-icons-round">more_horiz</span>
            </button>
          </div>

          {/* Post Image */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6 shadow-2xl group-hover:shadow-[0_0_40px_rgba(0,242,255,0.15)] transition-all duration-700">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
              {post.caption}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                <div className="w-8 h-8 rounded-full border-2 border-navy-deep bg-slate-800 flex items-center justify-center text-[10px] shadow-sm">
                  🔥
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-navy-deep bg-slate-800 flex items-center justify-center text-[10px] shadow-sm">
                  👏
                </div>
                {post._count.likes > 2 && (
                  <div className="w-8 h-8 rounded-full border-2 border-navy-deep bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold shadow-sm">
                    +{post._count.likes - 2}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-400">
                {post._count.likes} {post._count.likes === 1 ? "Like" : "Likes"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${liked
                  ? "neon-gradient text-navy-deep neon-glow"
                  : "glass-panel text-slate-400 hover:text-primary"
                  }`}
              >
                <span className="material-icons-round text-xl">
                  {liked ? "favorite" : "favorite_border"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 px-4 h-10 rounded-full transition-all ${showComments
                  ? "bg-primary/20 border border-primary/30 text-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                  : "glass-panel text-slate-400 hover:text-primary hover:bg-primary/10"
                  }`}
              >
                <span className="material-icons-round text-xl">chat_bubble</span>
                <span className="text-xs font-bold">{post._count.comments}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Panel — Toggled */}
        {showComments && (
          <div className="w-full md:w-72 lg:w-80 flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black tracking-[0.15em] text-primary uppercase">
                Comments
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[400px] scrollbar-hide">
              {post.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="material-icons-round text-3xl text-primary/20 mb-2">
                    chat_bubble_outline
                  </span>
                  <p className="text-xs text-slate-500">
                    No comments yet. Be the first!
                  </p>
                </div>
              ) : (
                post.comments.map((c) => (
                  <div key={c.id} className="flex gap-3 items-start">
                    {c.user.avatarUrl ? (
                      <img
                        src={c.user.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold shrink-0 border border-white/10 mt-0.5">
                        {(c.user.displayName || c.user.username)
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-white">
                          {c.user.displayName || c.user.username}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5 break-words">
                        {c.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleComment}
              className="p-4 mt-auto border-t border-white/5"
            >
              <div className="relative flex items-center">
                <input
                  name="body"
                  placeholder="Add a comment..."
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pr-12 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 placeholder:text-slate-600 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 w-8 h-8 neon-gradient rounded-xl flex items-center justify-center text-navy-deep shadow-lg hover:scale-105 transition-transform"
                >
                  <span className="material-icons-round text-base">send</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
