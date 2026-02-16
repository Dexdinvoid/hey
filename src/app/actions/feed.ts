"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const likeSchema = z.object({ postId: z.string().cuid() });
const commentSchema = z.object({
  postId: z.string().cuid(),
  body: z.string().min(1).max(500),
});

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = likeSchema.safeParse({ postId });
  if (!parsed.success) return { error: "Invalid post" };

  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: { postId, userId: user.id },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.like.create({
      data: { postId, userId: user.id },
    });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    if (post && post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "like",
          payload: JSON.stringify({ postId, fromUserId: user.id }),
        },
      });
    }
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function addComment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.body?.[0] ?? "Invalid input" };
  }

  const post = await prisma.post.findUnique({
    where: { id: parsed.data.postId },
    select: { userId: true },
  });
  if (!post) return { error: "Post not found" };

  await prisma.comment.create({
    data: {
      postId: parsed.data.postId,
      userId: user.id,
      body: parsed.data.body,
    },
  });

  if (post.userId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: "comment",
        payload: JSON.stringify({
          postId: parsed.data.postId,
          fromUserId: user.id,
          body: parsed.data.body.slice(0, 50),
        }),
      },
    });
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
