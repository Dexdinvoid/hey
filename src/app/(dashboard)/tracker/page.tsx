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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Habit Tracker</h1>
        <Link
          href="/dashboard"
          className="text-sm text-white/60 hover:text-white"
        >
          Back to Home
        </Link>
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-medium text-white">Activity</h2>
        <EnhancedLineChart completions={allCompletions} />
        <EnhancedHeatmap completions={allCompletions} />
      </section>

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Add habit</h2>
        <AddHabitForm />
      </section>

      <section className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-medium text-white mb-4">Your habits</h2>
        <HabitList habits={habits} />
      </section>
    </div>
  );
}
