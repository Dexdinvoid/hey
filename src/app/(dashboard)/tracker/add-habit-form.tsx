"use client";

import { useState } from "react";
import { createHabit } from "@/app/actions/habits";

export function AddHabitForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createHabit(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      form.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          Habit name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
          placeholder="e.g. Morning run"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          Description (optional)
        </label>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={500}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
          placeholder="e.g. 5k before work"
        />
      </div>
      <div>
        <label htmlFor="frequency" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          Frequency
        </label>
        <select
          id="frequency"
          name="frequency"
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all disabled:opacity-50"
      >
        <span className="material-icons-round text-lg">add_circle</span>
        {loading ? "Adding…" : "Add Habit"}
      </button>
    </form>
  );
}
