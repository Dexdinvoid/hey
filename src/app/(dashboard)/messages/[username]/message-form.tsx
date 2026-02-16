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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="body"
        placeholder="Type a message..."
        maxLength={2000}
        required
        className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
      >
        Send
      </button>
      {error && <p className="text-sm text-red-400 w-full mt-1">{error}</p>}
    </form>
  );
}
