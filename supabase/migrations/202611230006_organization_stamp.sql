-- BatasJamREG Organization Stamp Column, Public Assets Bucket & Storage RLS

-- 1. Add nullable stamp_url to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stamp_url TEXT NULL;

-- 2. Create idempotent public bucket org-assets (1 MB limit, PNG/WebP only)
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'org-assets',
  'org-assets',
  true,
  1048576,
  ARRAY['image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Idempotent Storage RLS policies for bucket org-assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can read org-assets'
  ) THEN
    CREATE POLICY "Public can read org-assets"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'org-assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Org owner can insert org-assets'
  ) THEN
    CREATE POLICY "Org owner can insert org-assets"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        CASE
          WHEN bucket_id = 'org-assets'
            AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN public.is_org_owner(((storage.foldername(name))[1])::uuid)
          ELSE false
        END
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Org owner can update org-assets'
  ) THEN
    CREATE POLICY "Org owner can update org-assets"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        CASE
          WHEN bucket_id = 'org-assets'
            AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN public.is_org_owner(((storage.foldername(name))[1])::uuid)
          ELSE false
        END
      )
      WITH CHECK (
        CASE
          WHEN bucket_id = 'org-assets'
            AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN public.is_org_owner(((storage.foldername(name))[1])::uuid)
          ELSE false
        END
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Org owner can delete org-assets'
  ) THEN
    CREATE POLICY "Org owner can delete org-assets"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        CASE
          WHEN bucket_id = 'org-assets'
            AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN public.is_org_owner(((storage.foldername(name))[1])::uuid)
          ELSE false
        END
      );
  END IF;
END $$;
