# Supabase Migration Quick Start Guide

## 🚀 Quick Start (TL;DR)

For those who want to get started immediately:

```bash
# 1. Create schema on target database
psql "[TARGET_DB_URL]" -f 01_complete_schema.sql

# 2. Export data from source
mkdir export_data
psql "[SOURCE_DB_URL]" -f 02_data_export.sql

# 3. Import data to target
psql "[TARGET_DB_URL]" -f 03_data_import.sql

# 4. Verify migration
psql "[TARGET_DB_URL]" -f 04_verify_migration.sql

# 5. Migrate storage (manual)
./05_storage_migration_helper.sh

# 6. Update app config
cp .env.template ../.env.local
# Edit .env.local with your credentials

# 7. Test application
npm run dev
```

## 📁 Files in This Directory

| File | Description |
|------|-------------|
| `README.md` | Complete migration guide with detailed instructions |
| `QUICK_START.md` | This file - quick reference guide |
| `01_complete_schema.sql` | Creates all database tables, functions, triggers, and RLS policies |
| `02_data_export.sql` | Exports all data from source database to TSV files |
| `03_data_import.sql` | Imports TSV files into target database |
| `04_verify_migration.sql` | Verifies migration integrity and data quality |
| `05_storage_migration_helper.sh` | Interactive helper for migrating storage files |
| `.env.template` | Environment variables template for app configuration |

## 📋 Pre-Migration Checklist

- [ ] Backup source database
- [ ] Self-hosted Supabase instance is running
- [ ] Have both database connection strings ready
- [ ] `psql` command-line tool installed
- [ ] Sufficient disk space for exports (~2x your database size)

## 🎯 Migration Order

**IMPORTANT**: Run scripts in this exact order:

1. **Schema First**: `01_complete_schema.sql` - Creates structure
2. **Export Data**: `02_data_export.sql` - Exports from source
3. **Import Data**: `03_data_import.sql` - Imports to target
4. **Verify**: `04_verify_migration.sql` - Validates migration
5. **Storage**: `05_storage_migration_helper.sh` - Migrates files
6. **Configure**: Update `.env.local` with new credentials

## 🔧 Connection String Format

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Lovable Supabase
Get from: Dashboard > Settings > Database > Connection String (Transaction mode)

### Self-Hosted Supabase
Format depends on your setup:
- Docker: `postgresql://postgres:postgres@localhost:54322/postgres`
- Custom: Use your configured host, port, and credentials

## ⚠️ Common Gotchas

1. **Wrong Order**: Must run schema before import
2. **Missing export_data**: Create directory before export
3. **Connection Timeout**: Use connection pooler for large imports
4. **RLS Issues**: Verify policies created correctly
5. **Storage URLs**: Update file URLs after storage migration

## 📊 Expected Results

### After Schema Creation (01)
```
✓ 19 tables created
✓ 3 custom types (enums)
✓ 3 functions
✓ 11 triggers
✓ 15+ indexes
✓ 50+ RLS policies
```

### After Data Import (03)
```
✓ All record counts match source
✓ No errors during import
✓ Foreign key constraints satisfied
```

### After Verification (04)
```
✓ 0 orphaned records
✓ 0 NULL values in required fields
✓ All indexes present
✓ All triggers functional
✓ All RLS policies active
```

## 🔍 Quick Verification Commands

```sql
-- Check table count (should be 19)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check record counts
SELECT 'cases' as table, COUNT(*) FROM cases
UNION ALL
SELECT 'accused', COUNT(*) FROM accused
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🚨 Rollback Plan

If something goes wrong:

```bash
# 1. Switch app back to old Supabase
# Edit .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://old-lovable-instance.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=old-key

# 2. Restart app
npm run dev

# 3. Investigate issues
# Review logs, check verification output

# 4. Fix and retry
# Drop and recreate schema if needed:
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;
```

## 📞 Need Help?

1. **Check README.md**: Detailed guide with troubleshooting
2. **Check verification output**: `04_verify_migration.sql` shows issues
3. **Check logs**: Application and database logs for errors
4. **Supabase Discord**: https://discord.supabase.com
5. **GitHub Issues**: Report bugs or ask questions

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Migration Guide](https://www.postgresql.org/docs/current/migration.html)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Success Criteria

Your migration is complete when:

- [ ] All tables exist with correct schema
- [ ] All data imported successfully
- [ ] Foreign keys intact (0 orphans)
- [ ] Indexes present and functional
- [ ] RLS policies active
- [ ] Storage files accessible
- [ ] Application connects successfully
- [ ] Users can log in
- [ ] All features working normally
- [ ] No errors in application logs

## 🎉 Post-Migration

After successful migration:

1. **Monitor**: Watch logs for 24-48 hours
2. **Performance**: Check query performance, add indexes if needed
3. **Backup**: Set up regular backups on self-hosted instance
4. **Documentation**: Update team documentation with new URLs
5. **Cleanup**: Decommission Lovable Supabase after 1-2 weeks of stability

---

**Ready to migrate?** Start with `README.md` for detailed instructions!
