"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import {
  getLeagueFromPoints,
  POINTS_PER_COMPLETION,
} from "@/lib/leagues";
import { uploadProofImage } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
});

const completeHabitSchema = z.object({
  habitId: z.string().cuid(),
});

export async function createHabit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    frequency: formData.get("frequency") || "daily",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input" };
  }

  await prisma.habit.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  });
  revalidatePath("/tracker");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function completeHabit(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const habitId = formData.get("habitId") as string;
  const file = formData.get("image") as File | null;
  if (!file?.size) return { error: "Image is required" };

  const parsed = completeHabitSchema.safeParse({ habitId });
  if (!parsed.success) return { error: "Invalid habit" };

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: user.id },
  });
  if (!habit) return { error: "Habit not found" };

  const uploadResult = await uploadProofImage(user.id, habitId, file);
  if ("error" in uploadResult) return { error: uploadResult.error };

  const pointsAwarded = POINTS_PER_COMPLETION;

  const userBefore = await prisma.user.findUnique({
    where: { id: user.id },
    select: { currentStreak: true, longestStreak: true },
  });

  await prisma.$transaction(async (tx) => {
    const completion = await tx.habitCompletion.create({
      data: {
        habitId,
        userId: user.id,
        imageUrl: uploadResult.url,
        pointsAwarded,
      },
    });

    const updated = await tx.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsAwarded },
        lastActiveAt: new Date(),
      },
    });

    const newLeague = getLeagueFromPoints(updated.points);
    if (updated.league !== newLeague) {
      await tx.user.update({
        where: { id: user.id },
        data: { league: newLeague },
      });
    }

    const recentCompletions = await tx.habitCompletion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 2,
    });
    const justCompleted = recentCompletions[0];
    const previous = recentCompletions[1];
    const completedDay = new Date(justCompleted.completedAt);
    completedDay.setHours(0, 0, 0, 0);
    const yesterday = new Date(completedDay);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (previous) {
      const prevDay = new Date(previous.completedAt);
      prevDay.setHours(0, 0, 0, 0);
      if (prevDay.getTime() === yesterday.getTime()) {
        newStreak = Math.min((userBefore?.currentStreak ?? 0) + 1, 999);
      }
    }
    const newLongest = Math.max(userBefore?.longestStreak ?? 0, newStreak);
    await tx.user.update({
      where: { id: user.id },
      data: { currentStreak: newStreak, longestStreak: newLongest },
    });

    await tx.post.create({
      data: {
        userId: user.id,
        habitId,
        habitCompletionId: completion.id,
        imageUrl: uploadResult.url,
        caption: `Completed: ${habit.name}`,
      },
    });
  });

  revalidatePath("/tracker");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await prisma.habit.deleteMany({
    where: { id: habitId, userId: user.id },
  });
  revalidatePath("/tracker");
  revalidatePath("/dashboard");
  return { ok: true };
}
