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
        <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1">
          Habit name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. Morning run"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-1">
          Description (optional)
        </label>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={500}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. 5k before work"
        />
      </div>
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-white/90 mb-1">
          Frequency
        </label>
        <select
          id="frequency"
          name="frequency"
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium"
      >
        {loading ? "Adding…" : "Add habit"}
      </button>
    </form>
  );
}
