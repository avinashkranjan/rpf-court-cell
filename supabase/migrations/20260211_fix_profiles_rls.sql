-- Migration: Fix Row-Level Security for profiles table
-- Issue: New officer registration fails with RLS policy violation
-- Date: 2026-02-11

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own profile during signup
-- This allows new users to create their profile row when registering
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own profile
-- This allows users to view their own profile information
CREATE POLICY "Users can read their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
-- This allows users to modify their own profile information
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow all authenticated users to read all profiles
-- This is necessary for officer selection dropdowns and displaying officer information in cases
CREATE POLICY "Authenticated users can read all profiles"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Note: We do NOT allow users to delete profiles for data integrity
-- Profile deletion should be handled through admin tools or separate processes
