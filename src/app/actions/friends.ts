"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().min(1).max(50) });
const requestSchema = z.object({ username: z.string().min(1).max(50) });
const respondSchema = z.object({
  requestId: z.string().cuid(),
  accept: z.boolean(),
});

export async function searchUsers(q: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", users: [] };

  const parsed = searchSchema.safeParse({ q: q.trim() });
  if (!parsed.success) return { error: "Invalid search", users: [] };

  const users = await prisma.user.findMany({
    where: {
      username: { contains: parsed.data.q.toLowerCase(), mode: "insensitive" },
      id: { not: user.id },
    },
    take: 20,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      points: true,
      league: true,
    },
  });

  const friendRequestIds = await prisma.friendRequest.findMany({
    where: { senderId: user.id },
    select: { receiverId: true, status: true },
  });
  const friendshipUserIds = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    select: { user1Id: true, user2Id: true },
  });
  const friendIds = new Set(
    friendshipUserIds.flatMap((f) =>
      f.user1Id === user.id ? [f.user2Id] : [f.user1Id]
    )
  );
  const pendingSent = new Set(
    friendRequestIds.filter((r) => r.status === "pending").map((r) => r.receiverId)
  );
  const pendingRecv = await prisma.friendRequest.findMany({
    where: { receiverId: user.id, status: "pending" },
    select: { senderId: true },
  });
  const pendingRecvIds = new Set(pendingRecv.map((r) => r.senderId));

  return {
    users: users.map((u) => ({
      ...u,
      isFriend: friendIds.has(u.id),
      pendingSent: pendingSent.has(u.id),
      pendingRecv: pendingRecvIds.has(u.id),
    })),
  };
}

export async function sendFriendRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const parsed = requestSchema.safeParse({ username });
  if (!parsed.success) return { error: "Invalid username" };

  const receiver = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (!receiver) return { error: "User not found" };
  if (receiver.id === user.id) return { error: "Cannot add yourself" };

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: user.id, user2Id: receiver.id },
        { user1Id: receiver.id, user2Id: user.id },
      ],
    },
  });
  if (existingFriendship) return { error: "Already friends" };

  const existingRequest = await prisma.friendRequest.findUnique({
    where: {
      senderId_receiverId: { senderId: user.id, receiverId: receiver.id },
    },
  });
  if (existingRequest) {
    if (existingRequest.status === "pending") return { error: "Request already sent" };
  }

  await prisma.friendRequest.create({
    data: { senderId: user.id, receiverId: receiver.id },
  });
  await prisma.notification.create({
    data: {
      userId: receiver.id,
      type: "friend_request",
      payload: JSON.stringify({ fromUserId: user.id }),
    },
  });
  revalidatePath("/friends");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function respondToFriendRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const requestId = formData.get("requestId") as string;
  const accept = formData.get("accept") === "true";
  const parsed = respondSchema.safeParse({ requestId, accept });
  if (!parsed.success) return { error: "Invalid request" };

  const req = await prisma.friendRequest.findFirst({
    where: { id: requestId, receiverId: user.id, status: "pending" },
  });
  if (!req) return { error: "Request not found" };

  await prisma.$transaction(async (tx) => {
    await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: accept ? "accepted" : "rejected" },
    });
    if (accept) {
      const [u1, u2] =
        req.senderId < req.receiverId
          ? [req.senderId, req.receiverId]
          : [req.receiverId, req.senderId];
      await tx.friendship.create({
        data: { user1Id: u1, user2Id: u2 },
      });
    }
  });
  revalidatePath("/friends");
  revalidatePath("/dashboard");
  return { ok: true };
}
