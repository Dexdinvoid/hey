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
        className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          Complete: {habitName}
        </h3>
        <p className="text-sm text-white/60 mb-4">
          Upload a photo as proof of completion.
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="habitId" value={habitId} />
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Proof image (required)
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="w-full text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-medium"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
