import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FriendsContent } from "./friends-content";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const [friendships, incomingRequests] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: authUser.id }, { user2Id: authUser.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
            league: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
            league: true,
          },
        },
      },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: authUser.id, status: "pending" },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  const friends = friendships.map((f) =>
    f.user1Id === authUser.id ? f.user2 : f.user1
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Friends</h1>
        <Link
          href="/dashboard"
          className="text-sm text-white/60 hover:text-white"
        >
          Back to Home
        </Link>
      </div>

      <FriendsContent
        currentUserId={authUser.id}
        friends={friends}
        incomingRequests={incomingRequests.map((r) => ({
          id: r.id,
          sender: r.sender,
        }))}
      />
    </div>
  );
}
