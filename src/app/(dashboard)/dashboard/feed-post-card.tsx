/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
    user: { username: string; displayName: string | null };
  }[];
  _count: { likes: number; comments: number };
};

export function FeedPostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const router = useRouter();
  const liked = post.likes.some((l) => l.userId === currentUserId);

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
    <li className="glass rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        {post.user.avatarUrl ? (
          <img
            src={post.user.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
            {(post.user.displayName || post.user.username)
              .slice(0, 1)
              .toUpperCase()}
          </div>
        )}
        <div>
          <Link
            href={`/profile/${post.user.username}`}
            className="font-medium text-white hover:text-purple-300"
          >
            {post.user.displayName || post.user.username}
          </Link>
          <span className="text-white/50 text-sm ml-2">
            {new Date(post.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
      </div>
      {post.caption && (
        <p className="text-white/80 text-sm mb-2">{post.caption}</p>
      )}
      <img
        src={post.imageUrl}
        alt=""
        className="rounded-lg w-full max-h-64 object-cover"
      />
      <div className="flex items-center gap-4 mt-2">
        <button
          type="button"
          onClick={handleLike}
          className={`text-sm font-medium transition-colors ${liked ? "text-purple-400" : "text-white/50 hover:text-white"
            }`}
        >
          {liked ? "Liked" : "Like"} · {post._count.likes}
        </button>
        <span className="text-sm text-white/50">
          {post._count.comments} comments
        </span>
      </div>
      {post.comments.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
          {post.comments.map((c) => (
            <li key={c.id} className="text-sm text-white/80">
              <Link
                href={`/profile/${c.user.username}`}
                className="font-medium text-white hover:text-purple-300"
              >
                {c.user.displayName || c.user.username}
              </Link>{" "}
              <span className="text-white/70">{c.body}</span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleComment} className="mt-3 flex gap-2">
        <input
          name="body"
          placeholder="Add a comment..."
          maxLength={500}
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
        >
          Post
        </button>
      </form>
    </li>
  );
}
