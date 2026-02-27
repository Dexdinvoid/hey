/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import type { User } from "@prisma/client";

const navItems = [
    { href: "/dashboard", label: "Home", icon: "home", iconType: "symbols" },
    { href: "/tracker", label: "Tracker", icon: "target", iconType: "symbols" },
    { href: "/friends", label: "Leaderboard", icon: "emoji_events", iconType: "round" },
    { href: "/challenges", label: "Explore", icon: "explore", iconType: "round" },
    { href: "/notifications", label: "Notifications", icon: "notifications", iconType: "round" },
    { href: "/messages", label: "Messages", icon: "chat_bubble", iconType: "round" },
];

export function Sidebar({ user }: { user: User | null }) {
    const pathname = usePathname();

    return (
        <aside className="w-20 lg:w-72 h-full glass-nav flex flex-col justify-between py-8 px-3 lg:px-6 relative z-20 shrink-0 transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-12 pl-1">
                <Link href="/dashboard" className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl neon-gradient flex items-center justify-center neon-glow">
                        <span className="material-icons-round text-navy-deep text-2xl">all_inclusive</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/70">
                        Consistency
                    </h1>
                </Link>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 ${isActive
                                    ? "bg-primary/10 border border-primary/20 text-white shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                                    : "text-slate-400 hover:text-primary hover:bg-primary/5 border border-transparent"
                                }`}
                        >
                            <span
                                className={`${item.iconType === "symbols" ? "material-symbols-outlined" : "material-icons-round"
                                    } ${isActive ? "text-primary" : ""} group-hover:scale-110 transition-transform`}
                            >
                                {item.icon}
                            </span>
                            <span className="font-medium hidden lg:block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="mt-auto">
                {user && (
                    <div className="glass-panel p-3 rounded-2xl flex items-center gap-3 border border-white/5 hover:border-primary/30 transition-all">
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border-2 border-primary/40 object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full neon-gradient flex items-center justify-center text-navy-deep font-bold text-sm shrink-0">
                                    {(user.displayName || user.username).slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <div className="hidden lg:block overflow-hidden">
                                <p className="text-sm font-bold truncate text-white">
                                    {user.displayName || user.username}
                                </p>
                                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                            </div>
                        </Link>
                        <form action={signOut}>
                            <button
                                type="submit"
                                className="material-icons-round text-slate-600 hover:text-primary transition-colors hidden lg:block"
                                title="Sign out"
                            >
                                logout
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </aside>
    );
}
