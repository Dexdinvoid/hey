"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function authErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("rate_limit") || lower.includes("email rate limit")) {
    return "Email rate limit exceeded. For local dev: Supabase Dashboard → Authentication → Providers → Email → turn OFF \"Confirm email\". For production: use Custom SMTP in Auth settings.";
  }
  return raw;
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: authErrorMessage(error.message) };
  }
  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = (formData.get("username") as string)?.trim().toLowerCase();

  if (!username || username.length < 2) {
    return { error: "Username must be at least 2 characters." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  if (data.user) {
    const baseUsername = username.replace(/[^a-z0-9_]/g, "");
    let finalUsername = baseUsername || email.split("@")[0];
    let suffix = 0;
    while (true) {
      const candidate = suffix ? `${finalUsername}${suffix}` : finalUsername;
      const existing = await prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!existing) {
        finalUsername = candidate;
        break;
      }
      suffix++;
    }
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        username: finalUsername,
        displayName: finalUsername,
      },
    });
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
