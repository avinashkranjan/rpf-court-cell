-- =====================================================================
-- RPF Court Cell - Storage Buckets Setup
-- Create and configure storage buckets for file uploads
-- =====================================================================
-- Run this in your Self-Hosted Supabase database AFTER schema creation
-- This creates storage buckets and RLS policies for file management
-- =====================================================================

-- Note: Storage buckets are typically created via Supabase Dashboard
-- This script provides the equivalent SQL commands for automation

-- =====================================================================
-- STEP 1: Create Storage Buckets
-- =====================================================================

-- Create bucket for case-related PDF documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for accused photographs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'accused-photos',
  'accused-photos',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for identity proof documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-proofs',
  'identity-proofs',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for digital signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for seized item photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seized-items',
  'seized-items',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for medical certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-certificates',
  'medical-certificates',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- STEP 2: Create RLS Policies for Storage
-- =====================================================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Case Documents Bucket Policies
-- =====================================================================

-- Allow authenticated users to read case documents
CREATE POLICY "Authenticated users can read case documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'case-documents');

-- Allow authenticated users to upload case documents
CREATE POLICY "Authenticated users can upload case documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-documents');

-- Allow users to update their own case documents
CREATE POLICY "Users can update own case documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'case-documents' AND auth.uid()::text = owner);

-- Allow users to delete their own case documents
CREATE POLICY "Users can delete own case documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-documents' AND auth.uid()::text = owner);

-- =====================================================================
-- Accused Photos Bucket Policies
-- =====================================================================

CREATE POLICY "Authenticated users can read accused photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'accused-photos');

CREATE POLICY "Authenticated users can upload accused photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'accused-photos');

CREATE POLICY "Users can update own accused photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'accused-photos' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own accused photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'accused-photos' AND auth.uid()::text = owner);

-- =====================================================================
-- Identity Proofs Bucket Policies
-- =====================================================================

CREATE POLICY "Authenticated users can read identity proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'identity-proofs');

CREATE POLICY "Authenticated users can upload identity proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'identity-proofs');

CREATE POLICY "Users can update own identity proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'identity-proofs' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own identity proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'identity-proofs' AND auth.uid()::text = owner);

-- =====================================================================
-- Signatures Bucket Policies
-- =====================================================================

CREATE POLICY "Authenticated users can read signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Users can update own signatures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'signatures' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'signatures' AND auth.uid()::text = owner);

-- =====================================================================
-- Seized Items Bucket Policies
-- =====================================================================

CREATE POLICY "Authenticated users can read seized item photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'seized-items');

CREATE POLICY "Authenticated users can upload seized item photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'seized-items');

CREATE POLICY "Users can update own seized item photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'seized-items' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own seized item photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'seized-items' AND auth.uid()::text = owner);

-- =====================================================================
-- Medical Certificates Bucket Policies
-- =====================================================================

CREATE POLICY "Authenticated users can read medical certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-certificates');

CREATE POLICY "Authenticated users can upload medical certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-certificates');

CREATE POLICY "Users can update own medical certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-certificates' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own medical certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-certificates' AND auth.uid()::text = owner);

-- =====================================================================
-- STEP 3: Verify Storage Setup
-- =====================================================================

-- Check created buckets
SELECT 
  id,
  name,
  public,
  file_size_limit / 1048576 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;

-- =====================================================================
-- STORAGE SETUP COMPLETE
-- =====================================================================
-- Buckets created: 6
-- Policies created: 24 (4 per bucket: SELECT, INSERT, UPDATE, DELETE)
-- 
-- Next Steps:
-- 1. Test file upload via application
-- 2. Migrate existing files from old storage
-- 3. Update file URLs in database if needed
-- =====================================================================
