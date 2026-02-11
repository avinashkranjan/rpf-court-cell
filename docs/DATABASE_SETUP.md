# Database Setup Guide

## Common Issues

### Issue 1: "No user or session returned from signup"

**Error Message:**
```
No user or session returned from signup
```

**Symptoms:**
- User is created in Supabase `auth.users` table
- Profile is NOT created in `profiles` table
- "No officers found" message in UI

**Cause:** Email confirmation is enabled in Supabase. When email confirmation is required, `signUp()` doesn't return a session until the email is verified.

**Solution:** Apply database trigger migration (recommended)

### Issue 2: Officer Registration Fails with RLS Error

**Error Message:**
```
Error creating profile:
{code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "profiles"'}
```

**Cause:** The `profiles` table has Row-Level Security (RLS) enabled but lacks proper policies to allow users to insert their profile during registration.

## Complete Setup Steps

### Step 1: Clean Up Existing Policies (if applicable)

If you've already run migrations, clean up first:

1. **Open Supabase Dashboard** → SQL Editor
2. **Run the cleanup script:**
   - Copy `supabase/migrations/cleanup_profiles_policies.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify cleanup:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```
   Should return 0 rows after cleanup.

### Step 2: Apply RLS Policies Migration

1. **Open SQL Editor** (new query)
2. **Copy and paste** contents of `supabase/migrations/20260211_fix_profiles_rls.sql`
3. **Click "Run"**
4. Wait for "Success" message

5. **Verify policies:**
   - Go to "Table Editor" → Select "profiles" table
   - Click the shield icon (🛡️) to see "Policies"
   - You should see exactly 4 policies:
     - ✅ Enable insert for authenticated users
     - ✅ Enable read for own profile
     - ✅ Enable read for all authenticated users
     - ✅ Enable update for own profile

### Step 3: Apply Database Trigger Migration (Critical!)

**This step is required if email confirmation is enabled.**

1. **Open SQL Editor** (new query)
2. **Copy and paste** contents of `supabase/migrations/20260211_auto_create_profile_trigger.sql`
3. **Click "Run"**
4. Wait for "Success" message

5. **Verify trigger:**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
   Should return 1 row showing the trigger on `auth.users`

**Why this is critical:**
- When email confirmation is enabled, `signUp()` doesn't return a session
- Without a session, RLS policies can't be used to create the profile
- The database trigger runs with elevated privileges and creates the profile automatically
- Works for both self-registration and admin-created officers

### What These Policies Do

| Policy Name | Type | Applies To | Purpose |
|------------|------|------------|---------|
| Enable insert for authenticated users | INSERT | authenticated | Allows authenticated users to create their profile during signup |
| Enable read for own profile | SELECT | authenticated | Allows users to view their own profile data |
| Enable read for all authenticated users | SELECT | authenticated | Allows viewing other officers for dropdowns and assignments |
| Enable update for own profile | UPDATE | authenticated | Allows users to modify their profile settings |

### Key Differences from Previous Version

The updated migration includes:
- ✅ **`TO authenticated`** clause - Ensures policies apply to authenticated users, not public
- ✅ **Cleaner policy names** - Avoids conflicts with existing policies
- ✅ **Proper scoping** - Uses `USING (true)` for read-all policy instead of `auth.role()` check
- ✅ **Cleanup script** - Removes duplicate/conflicting policies before applying new ones
- ✅ **Session handling fix** - Application code now explicitly sets the session before profile insertion

### Application Code Fix

The authentication code has been updated to explicitly set the session after signup and before profile insertion. This ensures `auth.uid()` is available for RLS policy checks:

```typescript
// In context/auth-context.tsx
const { data, error } = await supabase.auth.signUp({ email, password });
// NEW: Explicitly set session before profile insert
await supabase.auth.setSession({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
});
// Now profile insert works because auth.uid() is set
await supabase.from('profiles').insert({ id: data.user.id, ...profileData });
```

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

### Issue: Still getting RLS error after applying migration AND updating code
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
