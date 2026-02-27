import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { AddHabitForm } from "./add-habit-form";
import { HabitList } from "./habit-list";
import EnhancedHeatmap from "./enhanced-heatmap";
import EnhancedLineChart from "./enhanced-line-chart";

export default async function TrackerPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const habits = await prisma.habit.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      completions: {
        orderBy: { completedAt: "desc" },
        take: 30,
      },
    },
  });

  const allCompletions = await prisma.habitCompletion.findMany({
    where: { userId: authUser.id },
    orderBy: { completedAt: "desc" },
    take: 365,
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Habit Tracker</h2>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-icons-round text-base">arrow_back</span>
          Back to Home
        </Link>
      </div>

      {/* Activity Charts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="material-icons-round text-primary text-xl">insights</span>
          <h3 className="text-lg font-bold text-white">Activity</h3>
        </div>
        <EnhancedLineChart completions={allCompletions} />
        <EnhancedHeatmap completions={allCompletions} />
      </section>

      {/* Add Habit */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">add_circle</span>
          <h3 className="text-lg font-bold text-white">Add Habit</h3>
        </div>
        <AddHabitForm />
      </section>

      {/* Habit List */}
      <section className="glass-card rounded-[2rem] p-7 border-primary/20">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-icons-round text-primary text-xl">checklist</span>
          <h3 className="text-lg font-bold text-white">Your Habits</h3>
        </div>
        <HabitList habits={habits} />
      </section>
    </div>
  );
}
