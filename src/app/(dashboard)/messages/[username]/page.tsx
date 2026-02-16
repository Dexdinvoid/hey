import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { MessageForm } from "./message-form";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const username = (await params).username.toLowerCase();
  const other = await prisma.user.findUnique({
    where: { username },
  });
  if (!other) notFound();

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: authUser.id, user2Id: other.id },
        { user1Id: other.id, user2Id: authUser.id },
      ],
    },
  });
  if (!friendship) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/10">
        <p className="text-white/70">
          You can only message friends. Add{" "}
          <Link
            href={`/profile/${other.username}`}
            className="text-purple-400 hover:underline"
          >
            {other.displayName || other.username}
          </Link>{" "}
          as a friend first.
        </p>
        <Link
          href="/friends"
          className="inline-block mt-4 text-purple-400 hover:underline text-sm"
        >
          Go to Friends
        </Link>
      </div>
    );
  }

  const [u1, u2] =
    authUser.id < other.id
      ? [authUser.id, other.id]
      : [other.id, authUser.id];

  const conversation = await prisma.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, username: true, displayName: true },
          },
        },
      },
    },
  });

  const messages = conversation?.messages ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/friends"
          className="text-sm text-white/60 hover:text-white"
        >
          ← Friends
        </Link>
        <h1 className="text-xl font-semibold text-white">
          Message {other.displayName || other.username}
        </h1>
      </div>

      <div className="glass rounded-2xl border border-white/10 flex flex-col min-h-[400px]">
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-8">
              No messages yet. Say hi!
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.senderId === authUser.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    m.senderId === authUser.id
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <p className="text-sm">{m.body}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-white/10">
          <MessageForm otherUsername={other.username} />
        </div>
      </div>
    </div>
  );
}
