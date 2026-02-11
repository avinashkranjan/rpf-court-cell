-- Cleanup Script: Remove Duplicate and Conflicting RLS Policies
-- Run this BEFORE applying the new migration
-- This removes all existing policies to ensure a clean state

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Verify all policies are removed
-- Run this query to check - should return 0 rows
-- SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
