import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { ConditionalRightSidebar } from "@/components/conditional-right-sidebar";

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

  // Ensure user is synced
  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) {
    const { syncUser } = await import("@/lib/auth-helpers");
    dbUser = await syncUser(authUser);
  }

  return (
    <div className="h-screen overflow-hidden selection:bg-primary selection:text-black bg-background-dark relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob w-[500px] h-[500px] rounded-full bg-blue-600/20 top-[-100px] left-[-100px] animate-pulse" />
        <div className="blob w-[600px] h-[600px] rounded-full bg-blue-900/30 bottom-[-100px] right-[-100px]" />
        <div className="blob w-[300px] h-[300px] rounded-full bg-primary/15 top-[40%] left-[40%] mix-blend-screen" />
      </div>

      <div className="flex h-full w-full max-w-[1920px] mx-auto relative overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar user={dbUser} />

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative z-10">
          {/* Center Content */}
          <section className="flex-1 overflow-y-auto px-4 lg:px-12 py-8 scroll-smooth">
            <div className="max-w-7xl mx-auto pb-20">
              {children}
            </div>
          </section>

          {/* Right Sidebar */}
          <ConditionalRightSidebar />
        </main>
      </div>
    </div>
  );
}
