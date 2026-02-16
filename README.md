# Consistency

Habit tracking, gamified. Prove tasks with image proof, earn points, climb leagues, and compete with friends.

## Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Auth:** Supabase Auth (Email + OAuth)
- **Database:** PostgreSQL (Neon or Supabase), Prisma ORM
- **Storage:** Supabase Storage (images)
- **Realtime:** Supabase Realtime (Phase 3+)

## Setup

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` – PostgreSQL connection string (Neon or Supabase)
   - `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key  
- `OPENAI_API_KEY` – (optional) For AI-generated challenges

2. Create the database and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Create the Storage bucket (habit proof images):
   - **Option A (script):** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (Dashboard → Settings → API), then run:
     ```bash
     node scripts/setup-storage.cjs
     ```
   - **Option B (manual):** In [Supabase Dashboard](https://supabase.com/dashboard) → Storage → New bucket → name `proofs`, set **Public bucket** ON → Create.
   - **RLS:** If you get "new row violates row-level security policy" on upload, run the SQL in `docs/STORAGE_RLS.md` in the Dashboard SQL Editor.

4. Run the app:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Sign up, then use the dashboard, tracker, friends, and challenges tabs.

## Project structure

- `src/app/` – App Router pages and layouts
- `src/app/(dashboard)/` – Authenticated dashboard, tracker, friends, challenges, profile
- `src/app/actions/` – Server actions (auth, habits, etc.)
- `src/components/` – Navbar and shared UI
- `src/lib/` – Supabase client, Prisma db, utilities
- `prisma/schema.prisma` – Database schema

## Roadmap

- **Phase 1 (done):** Auth, dashboard, navbar, profile
- **Phase 2 (done):** Habits CRUD, image proof, points, leagues, heatmap
- **Phase 3 (done):** Social feed, likes, comments
- **Phase 4 (done):** Friends, requests, notifications
- **Phase 5 (done):** DMs and chat
- **Phase 6 (done):** AI challenges, leaderboards (global + friends)
