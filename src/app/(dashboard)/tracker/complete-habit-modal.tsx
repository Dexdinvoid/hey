"use client";

import { useRef } from "react";

type Props = {
  habitId: string;
  habitName: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function CompleteHabitModal({
  habitId,
  habitName,
  onClose,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("habitId", habitId);
    const file = formData.get("image") as File;
    if (!file?.size) {
      return;
    }
    await onSubmit(formData);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-[2rem] p-8 w-full max-w-md border-primary/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl neon-gradient flex items-center justify-center neon-glow">
            <span className="material-icons-round text-navy-deep text-xl">check_circle</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Complete: {habitName}
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-6 ml-[52px]">
          Upload a photo as proof of completion.
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="habitId" value={habitId} />
          <div>
            <label
              htmlFor="image"
              className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"
            >
              Proof image (required)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="w-full text-white/80 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-primary file:text-navy-deep file:font-bold file:text-xs file:cursor-pointer file:transition-all file:hover:-translate-y-0.5"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full glass-panel text-slate-400 hover:text-white text-sm font-bold border border-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all"
            >
              <span className="material-icons-round text-base">upload</span>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
