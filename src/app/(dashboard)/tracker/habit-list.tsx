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
      <p className="text-white/60 text-sm">No habits yet. Add one above.</p>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <ul className="space-y-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{habit.name}</p>
              {habit.description && (
                <p className="text-sm text-white/60">{habit.description}</p>
              )}
              <p className="text-xs text-white/50 mt-1">
                {habit.completions.length} completions · {habit.frequency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompletingId(habit.id)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => handleDelete(habit.id)}
                disabled={deletingId === habit.id}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 text-sm disabled:opacity-50"
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
