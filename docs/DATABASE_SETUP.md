# Database Setup Guide

## Issue: Officer Registration Fails with RLS Error

**Error Message:**
```
Error creating profile:
{code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "profiles"'}
```

**Cause:** The `profiles` table has Row-Level Security (RLS) enabled but no policies defined to allow users to insert their profile during registration.

## Solution: Apply RLS Policies

### Quick Fix (5 minutes)

1. **Log in to Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your RPF Court Cell project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open `supabase/migrations/20260211_fix_profiles_rls.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute the Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
   - Wait for "Success. No rows returned" message

5. **Verify the Fix**
   - Go to "Table Editor" → Select "profiles" table
   - Click the shield icon (🛡️) to see "Policies"
   - You should see 4 policies:
     - ✅ Users can insert their own profile
     - ✅ Users can read their own profile
     - ✅ Users can update their own profile
     - ✅ Authenticated users can read all profiles

### What These Policies Do

| Policy Name | Type | Purpose |
|------------|------|---------|
| Users can insert their own profile | INSERT | Allows new users to create their profile during signup |
| Users can read their own profile | SELECT | Allows users to view their own profile data |
| Users can update their own profile | UPDATE | Allows users to modify their profile settings |
| Authenticated users can read all profiles | SELECT | Allows viewing other officers for dropdowns and assignments |

## Testing the Fix

### Test 1: Register a New Officer

1. Go to the application `/register` page
2. Fill in all required fields:
   - Full Name
   - Designation (select from dropdown)
   - Post Name
   - Railway Zone
   - Phone (optional)
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Register"
4. Should see: "Registration Successful - Please check your email to verify your account"
5. Check your email for the verification link

### Test 2: Verify Database Entry

In Supabase Dashboard → Table Editor → profiles:
- You should see a new row with the user's information
- The `id` field should match the `auth.users` table `id`

### Test 3: Login with New Account

1. Click the verification link in your email
2. Go to `/login` page
3. Enter email and password
4. Should successfully log in and see the dashboard

## Common Issues

### Issue: "policy already exists" error
**Solution:** The migration has already been applied. This is safe - the policies are already in place.

### Issue: Still getting RLS error after applying migration
**Troubleshooting steps:**
1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'profiles';
   ```
   Should return `rowsecurity = true`

2. Check if policies exist:
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'profiles';
   ```
   Should return 4 policies

3. Clear browser cache and try again
4. Log out and log back in
5. Check Supabase logs for any errors

### Issue: "relation does not exist" error
**Solution:** The `profiles` table hasn't been created yet. Create it first:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  post_name TEXT NOT NULL,
  railway_zone TEXT NOT NULL,
  phone TEXT,
  belt_number TEXT,  -- Deprecated, will be removed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Then apply the RLS policies.

## Alternative: Using Supabase CLI

If you prefer using the command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db execute --file supabase/migrations/20260211_fix_profiles_rls.sql

# Verify
supabase db pull
```

## Security Considerations

These RLS policies ensure:
- ✅ Users can only create their own profile (not impersonate others)
- ✅ Users can only modify their own profile data
- ✅ All authenticated users can view profiles (required for officer selection)
- ✅ Unauthenticated users cannot access any profile data
- ✅ Users cannot delete profiles (maintains data integrity)

## Need Help?

1. Check Supabase Dashboard → Logs for detailed error messages
2. Review [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
3. Verify your Supabase connection in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
   ```

## Summary

✅ **Before Fix:** Users cannot register → RLS policy violation
✅ **After Fix:** Users can register → Profile created successfully
✅ **Security:** Enhanced with proper RLS policies
✅ **Functionality:** All officer features work correctly
