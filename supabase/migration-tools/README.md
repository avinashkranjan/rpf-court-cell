# RPF Court Cell - Complete Database Migration Guide

## 📋 Overview

This guide provides step-by-step instructions for migrating the complete RPF Court Cell database from **Lovable Supabase** to **Self-Hosted Supabase**.

## 🎯 Migration Strategy

The migration consists of three main phases:
1. **Schema Migration**: Create all database structures (tables, functions, triggers, RLS policies)
2. **Data Migration**: Export data from source and import to target
3. **Storage Migration**: Transfer file uploads and configure storage buckets
4. **Verification**: Validate data integrity and application connectivity

## 📦 What Gets Migrated

### Database Objects
- ✅ **19 Tables**: All application tables with proper relationships
- ✅ **3 Enums**: app_role, case_status, gender_type
- ✅ **3 Functions**: has_role, handle_new_user, update_updated_at_column
- ✅ **11 Triggers**: Auto-create profiles, update timestamps
- ✅ **15+ Indexes**: Performance optimization
- ✅ **50+ RLS Policies**: Row-level security for all tables

### Data
- ✅ **User Profiles**: Officer information
- ✅ **Cases**: All case records
- ✅ **Accused**: Defendant information
- ✅ **Legal Documents**: Arrest memos, seizure memos, court forwardings, etc.
- ✅ **Activity Logs**: Complete audit trail
- ✅ **Master Data**: Railway posts, law sections

### Files (Manual Migration Required)
- ⚠️ **PDF Documents**: Arrest memos, challans, certificates
- ⚠️ **Images**: Accused photographs, ID proofs, seized item photos
- ⚠️ **Signatures**: Digital signatures from officers

## 🔧 Prerequisites

### Tools Required
- **psql**: PostgreSQL command-line tool (comes with PostgreSQL)
- **Supabase CLI** (optional): `npm install -g supabase`
- **Access**: Database credentials for both source and target

### Before You Start
1. ✅ Backup your Lovable Supabase database
2. ✅ Set up your self-hosted Supabase instance
3. ✅ Have database connection strings ready
4. ✅ Ensure you have sufficient disk space for data export
5. ✅ Schedule downtime or maintenance window if needed

## 📝 Step-by-Step Migration Process

### Phase 1: Schema Migration

#### Step 1.1: Connect to Target Database

Using Supabase Dashboard:
```bash
# Navigate to your Self-Hosted Supabase Dashboard
# Go to: Settings > Database > Connection String
# Copy the connection string
```

Using psql:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
```

#### Step 1.2: Run Schema Creation Script

**Option A: Using Supabase Dashboard**
1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy contents of `01_complete_schema.sql`
5. Paste and click **Run** (or Ctrl+Enter)
6. Wait for completion (should take ~30 seconds)

**Option B: Using psql**
```bash
psql -h [YOUR-HOST] -U postgres -d postgres -f 01_complete_schema.sql
```

**Expected Output:**
```
CREATE TYPE
CREATE TYPE
CREATE TYPE
CREATE TABLE (x19)
CREATE INDEX (x15)
CREATE FUNCTION (x3)
CREATE TRIGGER (x11)
ALTER TABLE (x18)
CREATE POLICY (x50+)
```

#### Step 1.3: Verify Schema Creation

Run basic verification:
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 19 tables
```

---

### Phase 2: Data Migration

#### Step 2.1: Prepare Export Directory

On your local machine:
```bash
mkdir -p export_data
cd export_data
```

#### Step 2.2: Export Data from Source Database

**Connect to Lovable Supabase:**
```bash
# Get connection string from Lovable Supabase Dashboard
psql "[LOVABLE_SUPABASE_CONNECTION_STRING]"
```

**Run Export Script:**
```bash
# Make sure you're in the directory where export_data folder exists
psql "[LOVABLE_SUPABASE_CONNECTION_STRING]" -f 02_data_export.sql
```

This will create 18 TSV files in `export_data/`:
- `01_profiles.tsv`
- `02_user_roles.tsv`
- `03_railway_posts.tsv`
- ... (and so on)

**Verify Export:**
```bash
# Check files were created
ls -lh export_data/

# Check file sizes (should not be 0 bytes if you have data)
du -sh export_data/*
```

#### Step 2.3: Transfer Export Files

If source and target are on different machines:
```bash
# Using scp
scp -r export_data/ user@target-host:/path/to/migration-tools/

# Or compress first for faster transfer
tar -czf export_data.tar.gz export_data/
scp export_data.tar.gz user@target-host:/path/
# Then on target: tar -xzf export_data.tar.gz
```

#### Step 2.4: Import Data to Target Database

**Connect to Target Database:**
```bash
psql "[SELF_HOSTED_SUPABASE_CONNECTION_STRING]"
```

**Run Import Script:**
```bash
# Make sure export_data folder is accessible
psql "[SELF_HOSTED_SUPABASE_CONNECTION_STRING]" -f 03_data_import.sql
```

**Expected Output:**
```
Importing profiles...
COPY 50 (example - your count may vary)
Importing user_roles...
COPY 25
... (continues for all tables)
```

---

### Phase 3: Storage Migration

Supabase Storage buckets need to be created and files migrated manually.

#### Step 3.1: Create Storage Buckets

In Self-Hosted Supabase Dashboard:
1. Navigate to **Storage**
2. Create buckets:
   - `case-documents` (for PDFs)
   - `accused-photos` (for accused photographs)
   - `identity-proofs` (for ID documents)
   - `signatures` (for digital signatures)
   - `seized-items` (for seized item photos)
   - `medical-certificates` (for medical documents)

#### Step 3.2: Configure Bucket Policies

For each bucket, set appropriate RLS policies:

**Example policy for `case-documents`:**
```sql
-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read case documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'case-documents');

-- Allow case officers to upload
CREATE POLICY "Case officers can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-documents');
```

#### Step 3.3: Migrate Files

**Option A: Using Supabase CLI**
```bash
# Export from source
supabase storage download case-documents --all

# Upload to target
supabase storage upload case-documents --all
```

**Option B: Manual Transfer**
1. Download files from Lovable Supabase Storage
2. Re-upload to Self-Hosted Supabase Storage
3. Update URLs in database if storage path changes

**Option C: Using Script (recommended for large datasets)**
See `05_storage_migration_helper.sh` for automated approach.

---

### Phase 4: Verification

#### Step 4.1: Run Verification Script

```bash
psql "[SELF_HOSTED_SUPABASE_CONNECTION_STRING]" -f 04_verify_migration.sql
```

This checks:
- ✅ All tables exist
- ✅ Record counts match source
- ✅ Foreign key integrity
- ✅ No NULL values in required fields
- ✅ Indexes, triggers, functions present
- ✅ RLS policies configured
- ✅ Sample data verification

#### Step 4.2: Manual Testing

1. **Test Authentication**
   ```bash
   # Try logging in with existing credentials
   # Verify new user registration works
   ```

2. **Test Application Features**
   - Create a new case
   - Add an accused person
   - Generate an arrest memo
   - Upload a document

3. **Verify Data Integrity**
   ```sql
   -- Check specific records
   SELECT * FROM cases WHERE case_number = 'RPF/2024/01/0001';
   
   -- Verify relationships
   SELECT c.case_number, a.full_name 
   FROM cases c
   JOIN accused a ON a.case_id = c.id
   LIMIT 5;
   ```

---

## 🔄 Update Application Configuration

### Step 5.1: Update Environment Variables

Create `.env.local` in your application:
```bash
# Old Lovable Supabase (backup)
OLD_SUPABASE_URL=https://xxxxx.supabase.co
OLD_SUPABASE_ANON_KEY=eyJxxx...

# New Self-Hosted Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-self-hosted-instance.com
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJyyy...
SUPABASE_SERVICE_ROLE_KEY=eyJzzz... # For admin operations
```

### Step 5.2: Update Supabase Client Configuration

No code changes needed if using environment variables! The app will automatically use new credentials.

### Step 5.3: Test Application

```bash
# Start development server
npm run dev

# Or production build
npm run build
npm start
```

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "relation already exists" Error
**Solution:** Schema already created. Safe to ignore or drop tables and re-run.
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run schema script
```

#### Issue 2: Foreign Key Violations During Import
**Solution:** Import order might be wrong. Ensure you're using the provided scripts which respect dependencies.

#### Issue 3: RLS Policy Violations
**Solution:** Ensure policies are created correctly
```sql
-- Check policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Re-run policy creation section of schema script if needed
```

#### Issue 4: Authentication Issues After Migration
**Problem:** Users can't log in
**Solution:** 
1. Verify auth.users table is present (Supabase manages this)
2. Check if profiles were created for all users
3. Ensure RLS policies allow profile access

#### Issue 5: File URLs Not Working
**Problem:** Uploaded files return 404
**Solution:**
1. Verify storage buckets exist
2. Check bucket policies allow access
3. Update file URLs if storage domain changed
4. Run storage migration script

---

## 📊 Migration Checklist

Use this checklist to track your progress:

### Pre-Migration
- [ ] Backup Lovable Supabase database
- [ ] Set up Self-Hosted Supabase instance
- [ ] Install required tools (psql, Supabase CLI)
- [ ] Test connection to both databases
- [ ] Schedule maintenance window (if needed)

### Schema Migration
- [ ] Run `01_complete_schema.sql` on target database
- [ ] Verify all tables created (19 tables)
- [ ] Verify all functions created (3 functions)
- [ ] Verify all triggers created (11 triggers)
- [ ] Verify RLS enabled on all tables

### Data Migration
- [ ] Create `export_data` directory
- [ ] Run `02_data_export.sql` on source database
- [ ] Verify export files created (18 TSV files)
- [ ] Transfer files to target location (if needed)
- [ ] Run `03_data_import.sql` on target database
- [ ] Compare record counts (source vs target)

### Storage Migration
- [ ] Create storage buckets in target
- [ ] Configure bucket policies
- [ ] Download files from source storage
- [ ] Upload files to target storage
- [ ] Update file URLs in database (if needed)

### Verification
- [ ] Run `04_verify_migration.sql`
- [ ] Check foreign key integrity (0 orphans)
- [ ] Verify indexes exist
- [ ] Verify triggers functional
- [ ] Test RLS policies

### Application Updates
- [ ] Update `.env.local` with new credentials
- [ ] Test application startup
- [ ] Test user authentication
- [ ] Test case creation
- [ ] Test document upload
- [ ] Test data retrieval

### Post-Migration
- [ ] Monitor application logs for errors
- [ ] Verify all features working
- [ ] Update documentation with new URLs
- [ ] Communicate migration to users
- [ ] Decommission old Lovable Supabase (after confirmation)

---

## 🚨 Rollback Plan

If migration fails and you need to rollback:

1. **Keep Lovable Supabase Active**: Don't delete until migration is 100% verified
2. **Switch Environment Variables**: Revert to old Supabase credentials
3. **Redeploy Application**: With old configuration
4. **Analyze Issues**: Review logs and error messages
5. **Retry Migration**: After fixing identified issues

---

## 📞 Support and Additional Resources

### Documentation
- [Supabase Migration Docs](https://supabase.com/docs/guides/database/migration)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Commercial Support
- Consider Supabase Enterprise support for critical migrations
- Hire PostgreSQL migration specialists if needed

---

## 📝 Notes

- **Downtime**: Expect 30-60 minutes for small databases, longer for large datasets
- **Testing**: Always test in a staging environment first
- **Backup**: Keep multiple backups before, during, and after migration
- **Credentials**: Store all credentials securely
- **Monitoring**: Monitor application closely for 24-48 hours post-migration

---

## ✅ Migration Complete!

Once all checklist items are complete and verified:
1. Update DNS/URLs to point to new Supabase instance (if applicable)
2. Monitor application for 1-2 weeks
3. After confirming stability, decommission Lovable Supabase
4. Archive migration files for future reference

**Good luck with your migration! 🚀**
