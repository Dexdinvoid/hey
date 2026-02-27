import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const errorMsg = searchParams?.error ?? null;

  return (
    <div className="dark bg-background-dark font-display text-gray-100 antialiased min-h-screen flex flex-col relative overflow-hidden selection:bg-primary selection:text-white">

      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob w-[500px] h-[500px] rounded-full bg-blue-600/20 top-[-100px] left-[-100px] animate-pulse" />
        <div className="blob w-[600px] h-[600px] rounded-full bg-blue-900/30 bottom-[-100px] right-[-100px]" />
        <div className="blob w-[300px] h-[300px] rounded-full bg-primary/15 top-[40%] left-[40%] mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/40">
            {/* Bolt icon via SVG */}
            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Consistency</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a className="hover:text-white transition-colors" href="#">Manifesto</a>
          <a className="hover:text-white transition-colors" href="#">Leaderboards</a>
          <a className="hover:text-white transition-colors" href="#">Pricing</a>
        </div>
        <div className="md:hidden">
          <button className="text-white" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 py-8 gap-12 lg:gap-24 w-full max-w-[1400px] mx-auto">

        {/* Left Column: Hero */}
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">

          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-gray-300">Season 4 Live Now</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white">
            Habit tracking turned{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300 text-glow">
              multiplayer
            </span>
            .
          </h1>

          <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Stop building habits alone in the dark. Compete with friends, climb the global leaderboard, and gamify your self-improvement journey.
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {/* Avatar placeholders — no external images to avoid hydration issues */}
                <div className="w-10 h-10 rounded-full border-2 border-[#060B18] bg-blue-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#060B18] bg-blue-600 flex items-center justify-center text-xs font-bold text-white">S</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#060B18] bg-blue-400 flex items-center justify-center text-xs font-bold text-white">M</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#060B18] bg-gray-800 flex items-center justify-center text-xs font-medium text-white">+2k</div>
              </div>
              <p>challengers active today</p>
            </div>
          </div>

          {/* Floating Glass Cards */}
          <div className="relative hidden lg:block h-32 w-full mt-12 pointer-events-none">
            {/* Card 1: Streak */}
            <div className="glass-card-floating absolute left-0 top-0 p-4 rounded-xl flex items-center gap-3 animate-bounce">
              <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                🔥
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Current Streak</p>
                <p className="text-xl font-bold text-white">45 Days</p>
              </div>
            </div>
            {/* Card 2: Rank */}
            <div
              className="glass-card-floating absolute left-48 bottom-0 p-4 rounded-xl flex items-center gap-3"
              style={{ animation: "bounce 4s infinite 1s" }}
            >
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                🏆
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Global Rank</p>
                <p className="text-xl font-bold text-white">#12 Elite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Panel */}
        <div className="w-full max-w-md relative">
          {/* Glow behind form */}
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-90 translate-y-4" />

          <div className="glass-panel relative rounded-3xl p-8 lg:p-10 w-full overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Enter the Arena</h2>
              <p className="text-gray-400 text-sm">Sync your progress across all devices.</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <AuthForm />

            <p className="mt-8 text-center text-xs text-gray-500">
              New player?{" "}
              <Link href="/signup" className="text-white hover:text-primary transition-colors font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Ticker */}
      <footer className="w-full border-t border-white/5 bg-[#050510]/50 backdrop-blur-md relative z-20 overflow-hidden">
        <div className="flex items-center py-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#060B18] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#060B18] to-transparent z-10" />
          <div className="flex gap-12 login-ticker whitespace-nowrap px-4">
            <TickerItem color="bg-green-500" text="alex_j just completed" highlight="Morning Meditation" />
            <TickerItem color="bg-primary" text="sarah_99 leveled up to" highlight="Gold Tier" />
            <TickerItem color="bg-purple-500" text="New Challenge:" highlight="30 Days of Code" suffix=" starts tomorrow" />
            <TickerItem color="bg-orange-500" text="mike_fit hit a" highlight="100 Day Streak" suffix="!" />
            {/* Duplicated for seamless loop */}
            <TickerItem color="bg-green-500" text="alex_j just completed" highlight="Morning Meditation" />
            <TickerItem color="bg-primary" text="sarah_99 leveled up to" highlight="Gold Tier" />
            <TickerItem color="bg-purple-500" text="New Challenge:" highlight="30 Days of Code" suffix=" starts tomorrow" />
            <TickerItem color="bg-orange-500" text="mike_fit hit a" highlight="100 Day Streak" suffix="!" />
          </div>
        </div>
        <div className="border-t border-white/5 py-4 px-6 md:px-12 flex justify-between items-center text-xs text-gray-600">
          <p>© 2025 Consistency Inc.</p>
          <div className="flex gap-4">
            <a className="hover:text-gray-400" href="#">Privacy</a>
            <a className="hover:text-gray-400" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TickerItem({
  color,
  text,
  highlight,
  suffix,
}: {
  color: string;
  text: string;
  highlight: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
      <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
      <span>
        {text} <span className="text-white">{highlight}</span>
        {suffix}
      </span>
    </div>
  );
}
