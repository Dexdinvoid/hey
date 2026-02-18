"use client";

import { useState, useTransition } from "react";
import { signUpWithEmail, signInWithOAuth } from "../actions/auth";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [googlePending, startGoogleTransition] = useTransition();
  const [githubPending, startGithubTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await signUpWithEmail(formData);
    if (result?.error) setError(result.error);
  }

  function handleGoogle() {
    startGoogleTransition(async () => {
      await signInWithOAuth("google");
    });
  }

  function handleGithub() {
    startGithubTransition(async () => {
      await signInWithOAuth("github");
    });
  }

  const isPending = googlePending || githubPending;

  return (
    <>
      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isPending}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googlePending ? (
            <SpinnerIcon />
          ) : (
            <GoogleIcon />
          )}
          <span className="text-sm font-medium text-white">Google</span>
        </button>

        <button
          type="button"
          onClick={handleGithub}
          disabled={isPending}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {githubPending ? (
            <SpinnerIcon />
          ) : (
            <GithubIcon />
          )}
          <span className="text-sm font-medium text-white">GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-white/10" />
        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-widest">
          Or continue with
        </span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      {/* Email / Username / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-gray-400 ml-1 block">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="player@consistency.app"
              className="block w-full pl-11 pr-4 py-3.5 bg-[#050510]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label htmlFor="username" className="text-xs font-medium text-gray-400 ml-1 block">
            Username
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <UserIcon />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              minLength={2}
              placeholder="username"
              className="block w-full pl-11 pr-4 py-3.5 bg-[#050510]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-gray-400 ml-1 block">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="••••••••"
              className="block w-full pl-11 pr-4 py-3.5 bg-[#050510]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-4 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5 transition-all duration-200 mt-2 flex items-center justify-center gap-2 group"
        >
          Create Account
          <ArrowIcon />
        </button>
      </form>
    </>
  );
}

/* ── Icons ── */

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
