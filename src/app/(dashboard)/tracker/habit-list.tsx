"use client";

import { useState } from "react";
import { completeHabit, deleteHabit } from "@/app/actions/habits";
import type { Habit, HabitCompletion } from "@prisma/client";
import { CompleteHabitModal } from "./complete-habit-modal";

type HabitWithCompletions = Habit & { completions: HabitCompletion[] };

export function HabitList({ habits }: { habits: HabitWithCompletions[] }) {
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleComplete(formData: FormData) {
    setError(null);
    const result = await completeHabit(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setCompletingId(null);
    }
  }

  async function handleDelete(habitId: string) {
    setDeletingId(habitId);
    await deleteHabit(habitId);
    setDeletingId(null);
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-icons-round text-4xl text-primary/20 mb-3 block">task_alt</span>
        <p className="text-slate-500 text-sm">No habits yet. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <ul className="space-y-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between rounded-2xl glass-panel px-5 py-4 border border-white/5 hover:border-primary/30 transition-all"
          >
            <div>
              <p className="font-bold text-sm text-white">{habit.name}</p>
              {habit.description && (
                <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>
              )}
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1.5">
                {habit.completions.length} completions · {habit.frequency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompletingId(habit.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full neon-gradient text-navy-deep font-bold text-xs neon-glow hover:-translate-y-0.5 transition-all"
              >
                <span className="material-icons-round text-sm">check_circle</span>
                Complete
              </button>
              <button
                type="button"
                onClick={() => handleDelete(habit.id)}
                disabled={deletingId === habit.id}
                className="px-3 py-2 rounded-full glass-panel text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold border border-white/5 transition-all disabled:opacity-50"
              >
                {deletingId === habit.id ? "…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {completingId && (
        <CompleteHabitModal
          habitId={completingId}
          habitName={
            habits.find((h) => h.id === completingId)?.name ?? "Habit"
          }
          onClose={() => {
            setCompletingId(null);
            setError(null);
          }}
          onSubmit={handleComplete}
        />
      )}
    </div>
  );
}
