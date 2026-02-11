# Supabase Database Migrations

This directory contains SQL migrations for the RPF Court Cell application database.

## Prerequisites

- A Supabase project with an active database
- Access to the Supabase SQL Editor or CLI

## How to Apply Migrations

### Method 1: Using Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of the migration file you want to apply
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
8. Verify the query executed successfully (check for green success message)

### Method 2: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push

# Or apply a specific migration
supabase db execute --file supabase/migrations/MIGRATION_FILE.sql
```

## Available Migrations

### cleanup_profiles_policies.sql

**Purpose**: Removes duplicate and conflicting RLS policies on the profiles table.

**When to use**: 
- ⚠️ **Run this FIRST** if you've already applied the main migration but still get RLS errors
- If you see duplicate policies in your Supabase dashboard
- If policies show "Applies to: public" instead of "authenticated"

**What it does**:
- Drops all existing RLS policies on the profiles table
- Prepares for a clean reapplication of the correct policies

**Usage**:
```sql
-- In Supabase SQL Editor, run this first:
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- ... (see file for complete list)
```

### 20260211_fix_profiles_rls.sql

**Purpose**: Fixes the Row-Level Security (RLS) policies for the `profiles` table to allow new officer registration.

**Issue**: Without proper RLS policies, users cannot insert their profile information during signup, resulting in the error:
```
Error: new row violates row-level security policy for table "profiles"
```

**What it does**:
1. Enables RLS on the `profiles` table
2. Creates policy to allow **authenticated users** to insert their own profile during registration
3. Creates policy to allow users to read their own profile
4. Creates policy to allow users to update their own profile
5. Creates policy to allow all authenticated users to read all profiles (needed for officer dropdowns)

**Key Changes in Updated Version**:
- ✅ Uses `TO authenticated` to properly scope policies to authenticated users
- ✅ Cleaner policy names to avoid conflicts
- ✅ Better handling of the signup edge case
- ✅ Includes cleanup instructions for duplicate policies

**Required**: ✅ This migration must be applied for officer registration to work properly.

**Safe to run**: Yes, this migration is idempotent and safe to run multiple times.

## Migration Order

Apply migrations in chronological order (by filename/date):

1. `20260211_fix_profiles_rls.sql` - **CRITICAL**: Required for basic authentication to work

## Verifying Migrations

After applying a migration, you can verify it worked by:

1. In Supabase Dashboard, go to **Table Editor**
2. Select the table that was modified (e.g., `profiles`)
3. Click on the **Policies** tab (shield icon)
4. Verify the policies are listed and enabled

Alternatively, run this SQL query to check policies:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## Troubleshooting

### "relation already exists" error
If you see this error, the migration has already been applied. This is safe to ignore.

### "permission denied" error
Ensure you're running the migration with appropriate database permissions. In Supabase, you need to be the project owner or have sufficient privileges.

### Testing RLS Policies

You can test if the RLS policies are working correctly:

```sql
-- Test as authenticated user (replace USER_ID with a real user ID)
SELECT * FROM profiles WHERE id = 'USER_ID';

-- Should return the profile if the user has permission
INSERT INTO profiles (id, full_name, designation, post_name, railway_zone)
VALUES (auth.uid(), 'Test Officer', 'Inspector', 'Test Post', 'Eastern Railway');

-- Should succeed if RLS policies are correctly configured
```

## Rollback

If you need to rollback a migration, you can drop the policies:

```sql
-- Rollback for profiles RLS policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;

-- Optionally disable RLS (not recommended for production)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

## Support

For issues with migrations or database setup:
1. Check the Supabase logs in the Dashboard
2. Review the error messages in the SQL Editor
3. Consult the [Supabase RLS documentation](https://supabase.com/docs/guides/auth/row-level-security)
