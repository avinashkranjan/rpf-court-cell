# Fix Summary: Profile RLS Policy Error

## Issue
**Error Code:** 42501  
**Error Message:** `new row violates row-level security policy for table "profiles"`  
**Impact:** Officers cannot register new accounts

## Root Cause
The Supabase `profiles` table has Row-Level Security (RLS) enabled but lacks the necessary policies to allow:
- New users to insert their profile during registration
- Users to read and update their own profiles
- Authenticated users to view other officers' profiles (needed for dropdowns and assignments)

## Solution Implemented

### 1. SQL Migration File
Created `supabase/migrations/20260211_fix_profiles_rls.sql` with 4 RLS policies:

| Policy | Type | Purpose |
|--------|------|---------|
| Users can insert their own profile | INSERT | Allows profile creation during signup |
| Users can read their own profile | SELECT | Allows users to view their data |
| Users can update their own profile | UPDATE | Allows profile editing |
| Authenticated users can read all profiles | SELECT | Enables officer selection in forms |

### 2. Documentation
Created comprehensive documentation:
- **supabase/migrations/README.md** - Migration application guide
- **docs/DATABASE_SETUP.md** - Detailed setup with testing steps
- **docs/TROUBLESHOOTING.md** - Common issues and solutions
- **Updated README.md** - Added database setup section
- **Updated DB_MIGRATION_NOTES.md** - Added RLS policy information

### 3. Configuration
- **`.env.local.example`** - Template for Supabase credentials
- **Code comments** - Explained RLS requirement in auth-context.tsx

## How to Apply the Fix

### ⚠️ Important: Check for Duplicate Policies First

If you've already applied the migration but still see the error, you likely have duplicate or conflicting policies.

**Check your policies:**
```sql
SELECT policyname, cmd, qual, with_check, roles 
FROM pg_policies 
WHERE tablename = 'profiles';
```

**If you see duplicates or policies with "Applies to: public":**

### Step 1: Clean Up (Required if migration was already run)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `supabase/migrations/cleanup_profiles_policies.sql`
3. Click "Run" to remove all duplicate policies
4. Verify cleanup:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```
   Should return 0 rows after cleanup.

### Step 2: Apply Updated Migration

1. **Open Supabase Dashboard** at https://app.supabase.com
2. Navigate to **SQL Editor** → **New Query**
3. Copy contents of `supabase/migrations/20260211_fix_profiles_rls.sql`
4. Paste and click **"Run"**
5. Wait for success message

### Step 3: Verify

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
```
Should return exactly 4 policies:
- Enable insert for authenticated users (INSERT)
- Enable read for own profile (SELECT)
- Enable read for all authenticated users (SELECT)
- Enable update for own profile (UPDATE)

### Test Registration
1. Go to `/register` page
2. Fill in all fields
3. Click "Register"
4. Should see: "Registration Successful - Please check your email to verify your account"

## Security Review
✅ **Code Review:** Passed - No issues found  
✅ **CodeQL Security Scan:** Passed - 0 vulnerabilities  
✅ **Best Practices:** Follows Supabase RLS guidelines

### Security Features
- Users can only insert their own profile (prevents impersonation)
- Users can only modify their own data (data protection)
- Profile reads require authentication (no public access)
- Profile deletion is disabled (maintains data integrity)
- Uses `auth.uid()` for user identification (secure)

## Impact
### Before Fix
❌ Officer registration fails  
❌ Error code 42501 in browser console  
❌ Users cannot create accounts  

### After Fix
✅ Officer registration works  
✅ Profiles created successfully  
✅ Full authentication flow functional  
✅ Officer selection dropdowns populated  

## Files Changed
```
.env.local.example (new)
DB_MIGRATION_NOTES.md (updated)
README.md (updated)
context/auth-context.tsx (added comments)
docs/DATABASE_SETUP.md (new)
docs/TROUBLESHOOTING.md (new)
supabase/migrations/20260211_fix_profiles_rls.sql (new)
supabase/migrations/README.md (new)
```

## Backward Compatibility
✅ **100% Backward Compatible**
- Existing data is preserved
- No breaking changes to application code
- Only adds missing security policies
- Safe to apply to production databases

## Rollback Plan
If needed, policies can be removed:
```sql
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
```

## Next Steps for Deployment
1. Review the migration file
2. Apply to development/staging environment first
3. Test officer registration flow
4. Apply to production environment
5. Monitor Supabase logs for any issues

## Support Resources
- **Setup Guide:** [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Migration Guide:** [supabase/migrations/README.md](./supabase/migrations/README.md)
- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security

---

**Status:** ✅ Ready for Deployment  
**Priority:** Critical (blocks user registration)  
**Estimated Time to Apply:** 5 minutes  
**Risk Level:** Low (only adds security policies)
