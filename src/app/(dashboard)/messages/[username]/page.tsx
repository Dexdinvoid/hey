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
      <div className="glass-card rounded-[2rem] p-8 border-primary/20 text-center">
        <span className="material-icons-round text-5xl text-primary/30 mb-4 block">
          person_off
        </span>
        <p className="text-white/70 font-medium">
          You can only message friends. Add{" "}
          <Link
            href={`/profile/${other.username}`}
            className="text-primary hover:underline font-bold"
          >
            {other.displayName || other.username}
          </Link>{" "}
          as a friend first.
        </p>
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-full neon-gradient text-navy-deep font-bold text-sm neon-glow hover:-translate-y-0.5 transition-all"
        >
          <span className="material-icons-round text-lg">group</span>
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/friends"
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-icons-round text-base">arrow_back</span>
          Friends
        </Link>
        <h2 className="text-2xl font-bold text-white">
          Message {other.displayName || other.username}
        </h2>
      </div>

      {/* Chat Container */}
      <div className="glass-card rounded-[2rem] border-primary/20 flex flex-col min-h-[400px] overflow-hidden">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-icons-round text-5xl text-primary/20 mb-3">chat_bubble_outline</span>
              <p className="text-slate-500 text-sm">
                No messages yet. Say hi! 👋
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.senderId === authUser.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.senderId === authUser.id
                      ? "neon-gradient text-navy-deep"
                      : "glass-panel text-white border border-white/5"
                    }`}
                >
                  <p className="text-sm">{m.body}</p>
                  <p className={`text-[10px] mt-1.5 ${m.senderId === authUser.id ? "text-navy-deep/60" : "text-slate-600"}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-5 border-t border-white/5">
          <MessageForm otherUsername={other.username} />
        </div>
      </div>
    </div>
  );
}
