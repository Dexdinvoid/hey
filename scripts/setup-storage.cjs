/**
 * One-time setup: creates the "proofs" Storage bucket in Supabase.
 * Run: node scripts/setup-storage.cjs
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (from Dashboard → Settings → API).
 */
require("dotenv").config({ path: ".env" });

const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  console.error(
    "Get the service role key from Supabase Dashboard → Project Settings → API."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);
const BUCKET = "proofs";

async function main() {
  const { data, error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (error) {
    if (error.message && error.message.includes("already exists")) {
      console.log(`Bucket "${BUCKET}" already exists. You're good.`);
      return;
    }
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET}" created successfully (public, 5MB, images only).`);
}

main();
