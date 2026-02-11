-- Migration: Fix Row-Level Security for profiles table
-- Issue: New officer registration fails with RLS policy violation
-- Date: 2026-02-11
-- Updated: 2026-02-11 - Fixed policy to handle signup edge case

-- IMPORTANT: First, remove any existing conflicting policies
-- Run these commands if you have existing policies:
/*
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
*/

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert profiles
-- During signup, the user is authenticated (has a valid JWT) but the profile doesn't exist yet
-- This policy allows the authenticated user to insert their profile record
-- The check ensures they can only insert a profile with their own user ID
CREATE POLICY "Enable insert for authenticated users"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own profile
CREATE POLICY "Enable read for own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Allow all authenticated users to read all profiles
-- This is necessary for officer selection dropdowns and displaying officer information in cases
CREATE POLICY "Enable read for all authenticated users"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow users to update their own profile
CREATE POLICY "Enable update for own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: We do NOT allow users to delete profiles for data integrity
-- Profile deletion should be handled through admin tools or separate processes
