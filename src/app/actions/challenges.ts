"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getLeagueFromPoints } from "@/lib/leagues";

const CHALLENGE_BONUS_POINTS = 25;

export async function generateChallenge(type: "daily" | "weekly" | "monthly") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "AI challenges are not configured (OPENAI_API_KEY missing)" };
  }

  const prompt = `Generate one habit challenge for a gamified habit tracker app. Type: ${type}. Return only a JSON object with exactly: {"title": "short title", "description": "one sentence description of the challenge"}. No markdown, no code block.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });
    if (!res.ok) {
      return { error: `OpenAI error: ${res.status}` };
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { error: "No response from AI" };

    let parsed: { title: string; description: string };
    try {
      parsed = JSON.parse(content) as { title: string; description: string };
    } catch {
      return { error: "Invalid AI response" };
    }

    const challenge = await prisma.challenge.create({
      data: {
        title: parsed.title.slice(0, 200),
        description: parsed.description.slice(0, 500),
        type,
        points: CHALLENGE_BONUS_POINTS,
      },
    });
    revalidatePath("/challenges");
    return { ok: true, challengeId: challenge.id };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to generate challenge",
    };
  }
}

export async function acceptChallenge(challengeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) return { error: "Challenge not found" };

  await prisma.userChallenge.upsert({
    where: {
      userId_challengeId: { userId: user.id, challengeId },
    },
    create: { userId: user.id, challengeId, status: "active" },
    update: {},
  });
  revalidatePath("/challenges");
  return { ok: true };
}

export async function completeChallenge(challengeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const uc = await prisma.userChallenge.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
    include: { challenge: true },
  });
  if (!uc || uc.status !== "active") return { error: "Challenge not found or already completed" };

  const points = uc.challenge.points ?? CHALLENGE_BONUS_POINTS;

  await prisma.$transaction(async (tx) => {
    await tx.userChallenge.update({
      where: { userId_challengeId: { userId: user.id, challengeId } },
      data: { status: "completed", completedAt: new Date(), progress: 100 },
    });
    const updated = await tx.user.update({
      where: { id: user.id },
      data: { points: { increment: points } },
    });
    const newLeague = getLeagueFromPoints(updated.points);
    if (updated.league !== newLeague) {
      await tx.user.update({
        where: { id: user.id },
        data: { league: newLeague },
      });
    }
  });
  revalidatePath("/challenges");
  revalidatePath("/dashboard");
  return { ok: true };
}
