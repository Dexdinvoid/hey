"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/messages";

export function MessageForm({ otherUsername }: { otherUsername: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("otherUsername", otherUsername);
    const result = await sendMessage(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
      <input
        name="body"
        placeholder="Type a message..."
        maxLength={2000}
        required
        className="flex-1 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
      />
      <button
        type="submit"
        className="w-11 h-11 rounded-xl neon-gradient flex items-center justify-center text-navy-deep neon-glow hover:scale-105 transition-transform shrink-0"
      >
        <span className="material-icons-round text-xl">send</span>
      </button>
      {error && <p className="absolute -bottom-6 left-0 text-xs text-red-400">{error}</p>}
    </form>
  );
}
