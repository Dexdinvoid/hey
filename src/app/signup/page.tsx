import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-xl border border-white/10">
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Create account
          </h1>
          <p className="text-center text-white/70 text-sm mb-6">
            Join Consistency and level up your habits.
          </p>
          <SignupForm />
          <p className="text-center text-white/60 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
