import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) {
    const username =
      authUser.user_metadata?.username ||
      authUser.email?.split("@")[0]?.replace(/[^a-z0-9_]/gi, "") ||
      "user";
    const base = username.slice(0, 20).toLowerCase();
    let finalUsername = base;
    let n = 0;
    while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${base}${++n}`;
    }
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        username: finalUsername,
        displayName: authUser.user_metadata?.full_name || finalUsername,
        avatarUrl: authUser.user_metadata?.avatar_url,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      <Navbar user={dbUser} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
