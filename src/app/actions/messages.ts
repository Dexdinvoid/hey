"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sendSchema = z.object({
  otherUsername: z.string().min(1).max(50),
  body: z.string().min(1).max(2000),
});

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const otherUsername = (formData.get("otherUsername") as string)?.trim().toLowerCase();
  const body = (formData.get("body") as string)?.trim();
  const parsed = sendSchema.safeParse({ otherUsername, body });
  if (!parsed.success) return { error: "Invalid input" };

  const other = await prisma.user.findUnique({
    where: { username: parsed.data.otherUsername },
  });
  if (!other) return { error: "User not found" };

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: user.id, user2Id: other.id },
        { user1Id: other.id, user2Id: user.id },
      ],
    },
  });
  if (!friendship) return { error: "You can only message friends" };

  const [u1, u2] =
    user.id < other.id ? [user.id, other.id] : [other.id, user.id];

  const conversation = await prisma.conversation.upsert({
    where: {
      user1Id_user2Id: { user1Id: u1, user2Id: u2 },
    },
    create: { user1Id: u1, user2Id: u2 },
    update: {},
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/messages/${other.username}`);
  return { ok: true };
}
