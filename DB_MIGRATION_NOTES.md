# Database Migration Notes

## Row-Level Security (RLS) Policies for Profiles Table

### Status: ✅ CRITICAL - Must be applied for authentication to work

**Issue:** Without proper RLS policies, officer registration fails with error:
```
Error: new row violates row-level security policy for table "profiles"
```

**Migration File:** `supabase/migrations/20260211_fix_profiles_rls.sql`

**What it does:**
1. Enables RLS on the `profiles` table
2. Creates policies to allow:
   - Users to insert their own profile during signup
   - Users to read their own profile
   - Users to update their own profile
   - All authenticated users to read all profiles (for officer dropdowns)

**How to apply:**
1. Log in to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260211_fix_profiles_rls.sql`
4. Click "Run"
5. Verify success

**Detailed guide:** See [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)

---

## Belt Number Field Removal

### Changes Made in Application Code
✅ All references to `belt_number` have been removed from:
- Officer Management page
- Officer Combobox component
- Auth Context
- Settings page
- Registration page

### Database Schema Changes Required

The `belt_number` field still exists in the Supabase database schema in the `profiles` table. To complete the removal, the following database migration needs to be executed:

```sql
-- Migration: Remove belt_number column from profiles table
-- This is safe to run as the application no longer uses this field

ALTER TABLE profiles 
DROP COLUMN IF EXISTS belt_number;
```

### Steps to Apply Database Migration

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Execute the SQL migration above
4. After the migration is successful, regenerate the TypeScript types by running:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > integrations/supabase/types.ts
   ```

### Backward Compatibility

The current changes are backward compatible. Even though the `belt_number` field exists in the database:
- The application no longer reads or writes to this field
- Existing data is preserved (not deleted)
- The field can be safely removed when ready

### Notes

- The TypeScript types in `integrations/supabase/types.ts` still include `belt_number` as nullable
- This is intentional to maintain compatibility until the database schema is updated
- Once the database migration is complete, regenerate the types file to reflect the changes
