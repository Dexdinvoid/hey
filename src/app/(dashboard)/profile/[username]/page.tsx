/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnhancedHeatmap from "../../tracker/enhanced-heatmap";
import { XPGrowthChart } from "./xp-growth-chart";

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

  // Get auth user for "is own profile" check
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = authUser?.id === user.id;

  // Fetch friends count
  const friendsCount = await prisma.friendship.count({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
  });

  // Fetch completions for heatmap
  const completions = await prisma.habitCompletion.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 365,
    select: { completedAt: true, pointsAwarded: true },
  });

  // Fetch habits count & total completions
  const habitsCount = await prisma.habit.count({ where: { userId: user.id } });
  const totalCompletions = await prisma.habitCompletion.count({
    where: { userId: user.id },
  });

  // Fetch active challenges
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId: user.id, status: "active" },
    include: { challenge: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate completion percentage (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCompletions = await prisma.habitCompletion.count({
    where: { userId: user.id, completedAt: { gte: thirtyDaysAgo } },
  });
  const completionPercent =
    habitsCount > 0
      ? Math.min(100, Math.round((recentCompletions / (habitsCount * 30)) * 100))
      : 0;

  // Get XP progress for level
  const xpForCurrentLevel = user.points % 3000;
  const currentLevel = Math.floor(user.points / 3000) + 1;
  const xpPercent = Math.round((xpForCurrentLevel / 3000) * 100);

  // League icon mapping
  const leagueConfig: Record<
    string,
    { icon: string; color: string; glowColor: string }
  > = {
    Unranked: { icon: "help_outline", color: "from-slate-400 to-slate-600", glowColor: "rgba(148,163,184,0.3)" },
    Bronze: { icon: "shield", color: "from-amber-700 to-amber-900", glowColor: "rgba(180,83,9,0.4)" },
    Silver: { icon: "shield", color: "from-slate-300 to-slate-500", glowColor: "rgba(203,213,225,0.4)" },
    Gold: { icon: "emoji_events", color: "from-yellow-400 to-amber-500", glowColor: "rgba(251,191,36,0.4)" },
    Platinum: { icon: "workspace_premium", color: "from-cyan-300 to-blue-500", glowColor: "rgba(34,211,238,0.4)" },
    Diamond: { icon: "diamond", color: "from-cyan-400 to-primary", glowColor: "rgba(19,91,236,0.6)" },
  };

  const league = leagueConfig[user.league] || leagueConfig.Unranked;

  // Derive recent achievements from data
  const achievements = [];
  if (user.currentStreak >= 7) {
    achievements.push({
      icon: "local_fire_department",
      iconBg: "bg-orange-500/20 text-orange-400",
      title: `${user.currentStreak}-Day Streak!`,
      description: `You've been consistent for ${user.currentStreak} days.`,
      time: "Active",
    });
  }
  if (totalCompletions >= 50) {
    achievements.push({
      icon: "fitness_center",
      iconBg: "bg-primary/20 text-primary",
      title: `${totalCompletions} Completions`,
      description: "You've completed habits over 50 times!",
      time: "All time",
    });
  }
  if (user.points >= 1000) {
    achievements.push({
      icon: "emoji_events",
      iconBg: "bg-yellow-500/20 text-yellow-500",
      title: `${user.points.toLocaleString()} XP Earned`,
      description: "A true consistency champion.",
      time: "All time",
    });
  }
  if (user.longestStreak >= 14) {
    achievements.push({
      icon: "military_tech",
      iconBg: "bg-green-500/20 text-green-400",
      title: `Longest Streak: ${user.longestStreak} Days`,
      description: "Impressive dedication!",
      time: "Personal best",
    });
  }
  if (achievements.length === 0) {
    achievements.push({
      icon: "rocket_launch",
      iconBg: "bg-primary/20 text-primary",
      title: "Just Getting Started",
      description: "Complete habits and earn your first achievements!",
      time: "Now",
    });
  }

  // Challenge icon colors
  const challengeColors = [
    { bg: "bg-primary/20", text: "text-primary", bar: "bg-primary", border: "hover:border-primary/30" },
    { bg: "bg-green-500/20", text: "text-green-500", bar: "bg-green-500", border: "hover:border-green-500/30" },
    { bg: "bg-purple-500/20", text: "text-purple-500", bar: "bg-purple-500", border: "hover:border-purple-500/30" },
    { bg: "bg-orange-500/20", text: "text-orange-500", bar: "bg-orange-500", border: "hover:border-orange-500/30" },
    { bg: "bg-cyan-500/20", text: "text-cyan-400", bar: "bg-cyan-400", border: "hover:border-cyan-400/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Profile Stats
          </h1>
          <p className="text-slate-400 mt-2">
            Track your progress and consistency across all habits.
          </p>
        </div>
        {isOwnProfile && (
          <div className="flex gap-3">
            <button className="glass-panel px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2 text-sm">
              <span className="material-icons-round text-sm">share</span>
              Share Profile
            </button>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full transition shadow-lg shadow-primary/25 font-medium flex items-center gap-2 text-sm"
            >
              <span className="material-icons-round text-sm">arrow_back</span>
              Dashboard
            </Link>
          </div>
        )}
      </header>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ===== LEFT COLUMN: Profile Card + Quick Stats ===== */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary to-purple-500 shadow-[0_0_20px_rgba(19,91,236,0.4)]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-full h-full rounded-full object-cover border-4 border-[#0a0c10]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0a0c10] flex items-center justify-center text-4xl font-bold text-white">
                    {(user.displayName || user.username)
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div
                className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-[#0a0c10]"
                title="Online"
              />
            </div>

            <h2 className="text-xl font-bold text-white">
              {user.displayName || user.username}
            </h2>
            <p className="text-primary font-medium text-sm mt-1">
              @{user.username}
            </p>
            {user.bio && (
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Followers / Following */}
            <div className="flex items-center gap-4 mt-6 w-full">
              <div className="flex-1 bg-white/5 rounded-xl p-3">
                <span className="block text-2xl font-bold text-white">
                  {friendsCount}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Friends
                </span>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl p-3">
                <span className="block text-2xl font-bold text-white">
                  {habitsCount}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  Habits
                </span>
              </div>
            </div>

            {/* Level / XP Progress */}
            <div className="mt-6 w-full pt-6 border-t border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">
                  Level {currentLevel}
                </span>
                <span className="text-sm text-primary font-bold">
                  XP {xpForCurrentLevel.toLocaleString()}/3,000
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full shadow-[0_0_10px_rgba(19,91,236,0.4)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-panel rounded-[2rem] p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">bolt</span>
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                    <span className="material-icons-round text-lg">
                      local_fire_department
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm">Current Streak</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {user.currentStreak} Days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                    <span className="material-icons-round text-lg">
                      check_circle
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm">Completion</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {completionPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <span className="material-icons-round text-lg">
                      emoji_events
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm">Total Points</span>
                </div>
                <span className="text-xl font-bold text-white">
                  {user.points.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CENTER COLUMN: League + Heatmap + XP Chart + Achievements ===== */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* League Banner */}
          <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8"
            style={{ background: "rgba(16, 22, 34, 0.6)", backdropFilter: "blur(20px)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            {/* Animated Badge */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                <div
                  className="absolute inset-0 border-4 border-primary/30 rounded-full"
                  style={{ animation: "spin 10s linear infinite" }}
                />
                <div
                  className="absolute inset-2 border-2 border-dotted border-white/20 rounded-full"
                  style={{ animation: "spin 15s linear infinite reverse" }}
                />
                <div
                  className={`w-24 h-24 bg-gradient-to-b ${league.color} rounded-xl rotate-45 flex items-center justify-center relative z-10 border border-white/30 backdrop-blur-sm`}
                  style={{ boxShadow: `0 0 30px ${league.glowColor}` }}
                >
                  <span className="material-icons-round text-white text-5xl -rotate-45 drop-shadow-lg">
                    {league.icon}
                  </span>
                </div>
              </div>
            </div>

            {/* League Info */}
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {user.league} League
              </div>
              <h2
                className="text-3xl font-bold text-white mb-2"
                style={{ textShadow: "0 0 10px rgba(19, 91, 236, 0.6)" }}
              >
                {user.league} League
              </h2>
              <p className="text-slate-400 mb-6">
                {user.currentStreak > 0
                  ? `You're on a ${user.currentStreak}-day streak! Keep pushing to reach the next league.`
                  : "Start your journey — build a streak and climb the ranks!"}
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Streak</p>
                  <p className="text-white font-mono text-lg">
                    {user.currentStreak}d
                  </p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Best</p>
                  <p className="text-white font-mono text-lg">
                    {user.longestStreak}d
                  </p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Total XP</p>
                  <p className="text-white font-mono text-lg">
                    {user.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consistency Heatmap (existing component) */}
          <div className="glass-panel rounded-[2rem] p-6 w-full overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons-round text-primary">
                calendar_view_month
              </span>
              <h3 className="text-white font-bold">Consistency Heatmap</h3>
            </div>
            <EnhancedHeatmap completions={completions} />
          </div>

          {/* XP Growth Chart */}
          <div className="glass-panel rounded-[2rem] p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-icons-round text-primary">
                  show_chart
                </span>
                XP Growth
              </h3>
            </div>
            <XPGrowthChart completions={completions} />
          </div>

          {/* Recent Achievements */}
          <div className="glass-panel rounded-[2rem] p-6">
            <h3 className="text-white font-bold mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((ach, i) => (
                <div
                  key={i}
                  className="flex items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${ach.iconBg} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}
                  >
                    <span className="material-icons-round">{ach.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">
                      {ach.title}
                    </h4>
                    <p className="text-slate-400 text-xs">{ach.description}</p>
                  </div>
                  <span className="text-slate-500 text-xs">{ach.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Active Challenges ===== */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass-panel rounded-[2rem] p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold">Active Challenges</h3>
              <Link
                href="/challenges"
                className="text-primary hover:text-white text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {userChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-icons-round text-4xl text-primary/20 mb-3 block">
                    emoji_events
                  </span>
                  <p className="text-slate-500 text-sm">
                    No active challenges yet.
                  </p>
                </div>
              ) : (
                userChallenges.map((uc, i) => {
                  const colors = challengeColors[i % challengeColors.length];
                  const progress = Math.min(100, uc.progress);
                  return (
                    <div
                      key={uc.id}
                      className={`p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 ${colors.border} transition-all group`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`${colors.bg} p-2 rounded-lg ${colors.text}`}>
                          <span className="material-icons-round">
                            {uc.challenge.type === "daily"
                              ? "today"
                              : uc.challenge.type === "weekly"
                                ? "date_range"
                                : "calendar_month"}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">
                          {progress}%
                        </span>
                      </div>
                      <h4 className="text-white font-bold mb-1 text-sm">
                        {uc.challenge.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        {uc.challenge.description}
                      </p>
                      <div className="w-full bg-[#0a0c10] rounded-full h-1.5 mb-1">
                        <div
                          className={`${colors.bar} h-1.5 rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p
                        className={`text-right text-[10px] ${colors.text}`}
                      >
                        {progress}% Complete
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/challenges"
              className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-icons-round text-sm">add</span>
              <span>Join New Challenge</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
