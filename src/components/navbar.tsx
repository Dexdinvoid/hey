/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import type { User } from "@prisma/client";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/tracker", label: "Tracker" },
  { href: "/friends", label: "Friends" },
  { href: "/challenges", label: "Challenges" },
];

export function Navbar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-14 max-w-4xl">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-white hover:text-purple-300 transition-colors"
        >
          Consistency
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="text-sm text-white/70 hover:text-white"
          >
            Notifications
          </Link>
          <span className="text-sm text-white/80 hidden sm:inline">
            {user.points} pts · {user.league}
          </span>
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-2"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {(user.displayName || user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
