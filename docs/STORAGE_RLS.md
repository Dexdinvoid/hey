# Storage RLS: "new row violates row-level security policy"

Supabase Storage has RLS enabled. Without policies, uploads to the `proofs` bucket are denied.

## Fix: run this SQL once

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**, run:

```sql
-- Drop if you need to re-run this script
DROP POLICY IF EXISTS "Users can upload proof images in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Public read for proofs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own proof images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own proof images" ON storage.objects;

-- Allow authenticated users to upload only to their own folder (userId/habitId/...)
CREATE POLICY "Users can upload proof images in their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to read (so proof image URLs work in the feed)
CREATE POLICY "Public read for proofs bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proofs');

-- Allow users to update/delete only their own files
CREATE POLICY "Users can update own proof images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own proof images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
```

Then click **Run**. After that, proof image uploads should work.
