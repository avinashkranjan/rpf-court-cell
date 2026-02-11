# Troubleshooting Guide

This guide helps resolve common issues with the RPF Court Cell application.

## Table of Contents
1. [Authentication Issues](#authentication-issues)
2. [Database Connection Issues](#database-connection-issues)
3. [Development Environment Issues](#development-environment-issues)

---

## Authentication Issues

### Error: "new row violates row-level security policy for table 'profiles'"

**Symptom:** When registering a new officer, you see an error in the browser console:
```
Error creating profile:
{code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "profiles"'}
```

**Cause:** The Supabase `profiles` table has Row-Level Security (RLS) enabled but doesn't have the correct policies to allow user registration.

**Solution:**
1. Apply the RLS migration: `supabase/migrations/20260211_fix_profiles_rls.sql`
2. Follow the detailed guide in [docs/DATABASE_SETUP.md](./DATABASE_SETUP.md)
3. Quick steps:
   - Open Supabase Dashboard → SQL Editor
   - Copy and paste the migration file contents
   - Click "Run"
   - Verify 4 policies were created in Table Editor → profiles → Policies

**Verification:**
```sql
-- Run this in Supabase SQL Editor to verify policies exist
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
```
Should return 4 policies: INSERT, SELECT (2x), UPDATE

---

### Error: "Invalid login credentials" when trying to sign in

**Possible Causes:**
1. **Email not verified** - Check your email for the verification link from Supabase
2. **Wrong password** - Passwords are case-sensitive
3. **User doesn't exist** - Complete registration first

**Solution:**
1. If newly registered, check your email for verification link
2. Click the verification link to activate your account
3. Try logging in again
4. If still failing, try password reset

**Password Requirements:**
- Minimum 6 characters
- Must match the password confirmation field during registration

---

### Users can't see other officers in dropdowns

**Symptom:** Officer selection dropdowns are empty or only show the current user.

**Cause:** Missing the "Authenticated users can read all profiles" RLS policy.

**Solution:**
Ensure this policy exists on the `profiles` table:
```sql
CREATE POLICY "Authenticated users can read all profiles"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');
```

This policy is included in the main RLS migration file.

---

## Database Connection Issues

### Error: "Failed to fetch" or "Network error" when trying to authenticate

**Possible Causes:**
1. Missing or incorrect Supabase credentials in `.env.local`
2. Supabase project is paused (happens on free tier after inactivity)
3. Network/firewall blocking Supabase

**Solution:**

**Step 1:** Verify your `.env.local` file exists and has correct values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**Step 2:** Get the correct values:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon/public" key

**Step 3:** Restart your development server:
```bash
npm run dev
```

**Step 4:** Check if your Supabase project is active:
- In Supabase Dashboard, projects should show "Active" status
- If "Paused", click "Restore" to reactivate (may take a few minutes)

---

### Error: "relation 'profiles' does not exist"

**Cause:** The `profiles` table hasn't been created in your Supabase database.

**Solution:**
Create the table using this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Then apply the RLS policies from the migration file
```

---

## Development Environment Issues

### Error: "Module not found" or import errors

**Cause:** Dependencies not installed or corrupted node_modules.

**Solution:**
```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Clear npm cache (optional)
npm cache clean --force

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

---

### TypeScript errors about Supabase types

**Symptom:** TypeScript complains about missing types or incorrect Database schema.

**Cause:** The generated types in `integrations/supabase/types.ts` are out of sync with your database.

**Solution:**
Regenerate the types from your Supabase schema:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# Generate new types
npx supabase gen types typescript --linked > integrations/supabase/types.ts
```

---

### Port 3000 already in use

**Symptom:** Can't start dev server because port 3000 is occupied.

**Solution:**

**Option 1:** Stop the process using port 3000:
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with the actual process ID)
kill -9 PID
```

**Option 2:** Use a different port:
```bash
PORT=3001 npm run dev
```

---

## Getting More Help

### Check Application Logs

**Browser Console:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

**Supabase Logs:**
1. Supabase Dashboard → Logs
2. Check for authentication errors
3. Look for policy violations or SQL errors

### Common Log Messages

| Message | Meaning | Action |
|---------|---------|--------|
| "new row violates row-level security policy" | Missing RLS policies | Apply RLS migration |
| "Invalid JWT" | Auth token expired or invalid | Log out and log back in |
| "permission denied for table" | Missing database permissions | Check RLS policies |
| "relation does not exist" | Table not created | Create the table in Supabase |

### Enable Debug Mode

Add this to your `.env.local` for more verbose logging:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
NODE_ENV=development
```

### Still Need Help?

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Open an issue in the repository with:
   - Clear description of the problem
   - Steps to reproduce
   - Error messages (from browser console and Supabase logs)
   - Your environment (Node version, OS, browser)

---

## Quick Checklist for New Setup

Use this checklist when setting up the application for the first time:

- [ ] Node.js 20+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] `.env.local` file created with Supabase credentials
- [ ] `profiles` table created in Supabase
- [ ] RLS policies applied (migration file)
- [ ] Policies verified in Supabase Dashboard
- [ ] Development server started (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can register a new officer
- [ ] Can verify email and login
- [ ] Can see dashboard after login

If any step fails, refer to the relevant section in this guide.
