import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white mb-2">Consistency</h1>
        <p className="text-white/70 mb-8">
          Habit tracking, gamified. Prove it with photos, earn points, climb leagues, and compete with friends.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg glass border border-white/20 text-white hover:bg-white/10 font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
