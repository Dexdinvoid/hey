"use client";

import Link from "next/link";

type RightSidebarProps = {
    habits?: { name: string; completed: boolean; icon: string }[];
};

export function RightSidebar({ habits }: RightSidebarProps) {
    const defaultHabits = habits || [
        { name: "Meditate 10m", completed: true, icon: "self_improvement" },
        { name: "Drink 2L Water", completed: true, icon: "water_drop" },
        { name: "Read 30 mins", completed: false, icon: "menu_book" },
    ];

    const completedCount = defaultHabits.filter((h) => h.completed).length;
    const percentage = Math.round((completedCount / defaultHabits.length) * 100);

    return (
        <aside className="hidden xl:flex w-[380px] flex-col gap-6 p-8 relative overflow-y-auto shrink-0">
            {/* Log New Habit Button */}
            <Link
                href="/tracker"
                className="w-full py-5 rounded-[10px] neon-gradient text-navy-deep font-extrabold text-lg neon-glow neon-glow-hover hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
                <span className="material-icons-round text-2xl group-hover:rotate-90 transition-transform">
                    add_circle
                </span>
                Log New Habit
            </Link>

            {/* Daily Goals */}
            <div className="glass-panel rounded-3xl p-7 border border-primary/20 shadow-lg">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-0.5">Daily Goals</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                            Streak Status
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">
                            {percentage}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-8 relative">
                    <div
                        className="h-full neon-gradient neon-glow rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Habit List */}
                <div className="space-y-4">
                    {defaultHabits.map((habit, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer ${habit.completed
                                    ? "bg-primary/10 border border-primary/20 hover:bg-primary/20"
                                    : "glass-panel border border-white/5 hover:border-primary/30"
                                }`}
                        >
                            {habit.completed ? (
                                <div className="w-7 h-7 rounded-lg neon-gradient flex items-center justify-center neon-glow">
                                    <span className="material-icons-round text-navy-deep text-lg">check</span>
                                </div>
                            ) : (
                                <div className="w-7 h-7 rounded-lg border-2 border-slate-700 group-hover:border-primary/50 transition-colors" />
                            )}
                            <div className="flex-1">
                                <span
                                    className={`text-sm font-bold ${habit.completed
                                            ? "line-through opacity-50 text-white"
                                            : "text-slate-300"
                                        }`}
                                >
                                    {habit.name}
                                </span>
                            </div>
                            {habit.completed ? (
                                <span className="text-[10px] text-primary font-black uppercase tracking-tighter">
                                    Completed
                                </span>
                            ) : (
                                <span className="material-icons-round text-slate-700 text-lg">
                                    chevron_right
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Trending Challenges */}
            <div className="glass-panel rounded-3xl p-7 flex-1 flex flex-col border border-white/5 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Trending Challenges</h3>
                    <span className="material-icons-round text-slate-600">trending_up</span>
                </div>

                <div className="space-y-5">
                    <Link href="/challenges" className="flex gap-4 items-center group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-900 to-navy-deep flex items-center justify-center text-2xl shrink-0 border border-white/5 group-hover:border-primary/30 transition-colors">
                            🧘
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-0.5">
                                Mindfulness Week
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">2,482 participants</p>
                        </div>
                    </Link>
                    <Link href="/challenges" className="flex gap-4 items-center group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-navy-deep flex items-center justify-center text-2xl shrink-0 border border-white/5 group-hover:border-primary/30 transition-colors">
                            🥑
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-0.5">
                                Hydration Pro
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">5,109 participants</p>
                        </div>
                    </Link>
                </div>

                <Link
                    href="/challenges"
                    className="mt-auto w-full py-3.5 rounded-2xl glass-panel text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 hover:border-primary/20 transition-all border border-white/5 text-center mt-6"
                >
                    Discover More
                </Link>
            </div>
        </aside>
    );
}
