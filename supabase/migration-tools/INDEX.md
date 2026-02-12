# Supabase Migration Tools - Index

## 📦 Complete Migration Package

This directory contains everything you need to migrate your RPF Court Cell database from Lovable Supabase to Self-Hosted Supabase.

## 📑 File Index

### Documentation
| File | Purpose | When to Read |
|------|---------|--------------|
| **README.md** | Complete migration guide with detailed instructions | Read first - comprehensive guide |
| **QUICK_START.md** | Quick reference for experienced users | After reading README |
| **INDEX.md** | This file - directory overview | For navigation |

### SQL Scripts
| File | Purpose | Execution Order |
|------|---------|-----------------|
| **01_complete_schema.sql** | Creates all database objects (tables, functions, triggers, RLS) | Run 1st on TARGET |
| **02_data_export.sql** | Exports all data from source database | Run 2nd on SOURCE |
| **03_data_import.sql** | Imports data into target database | Run 3rd on TARGET |
| **04_verify_migration.sql** | Verifies migration integrity | Run 4th on TARGET |
| **06_storage_buckets_setup.sql** | Creates storage buckets and policies | Run 5th on TARGET (optional) |

### Helper Scripts
| File | Purpose | Usage |
|------|---------|-------|
| **05_storage_migration_helper.sh** | Interactive storage migration tool | Run after data migration |
| **.env.template** | Environment variables template | Copy to `.env.local` and configure |

## 🎯 Migration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Migration Workflow                        │
└─────────────────────────────────────────────────────────────┘

1. Preparation
   ├── Read README.md
   ├── Backup source database
   ├── Setup self-hosted Supabase
   └── Install psql tool

2. Schema Migration (TARGET database)
   └── Run: 01_complete_schema.sql
       ├── Creates 19 tables
       ├── Creates 3 enums
       ├── Creates 3 functions
       ├── Creates 11 triggers
       └── Creates 50+ RLS policies

3. Data Export (SOURCE database)
   └── Run: 02_data_export.sql
       └── Creates export_data/*.tsv files

4. Data Import (TARGET database)
   └── Run: 03_data_import.sql
       └── Imports from export_data/*.tsv

5. Verification (TARGET database)
   └── Run: 04_verify_migration.sql
       ├── Checks table existence
       ├── Verifies record counts
       ├── Validates foreign keys
       └── Tests RLS policies

6. Storage Migration
   ├── Run: 06_storage_buckets_setup.sql (optional - automates bucket creation)
   └── Run: 05_storage_migration_helper.sh (interactive)
       ├── Create buckets
       ├── Export files
       ├── Import files
       └── Update URLs

7. Application Configuration
   ├── Copy .env.template to .env.local
   ├── Fill in credentials
   └── Test application

8. Post-Migration
   ├── Monitor application
   ├── Verify all features
   └── Decommission old database
```

## 📊 Database Schema Overview

### Core Tables (4)
- **profiles** - User officer information
- **cases** - Case records
- **accused** - Defendant information
- **case_officers** - Officer assignments

### Document Tables (8)
- **arrest_memos** - Arrest documentation
- **seizure_memos** - Seizure records
- **seized_items** - Seized property items
- **personal_search_memos** - Personal search records
- **personal_search_items** - Items found in searches
- **medical_memos** - Medical examination records
- **court_forwardings** - Court forwarding documents
- **bnss_checklists** - BNSS compliance checklists

### Challan Tables (2)
- **accused_challans** - Prosecution documents
- **challan_accused** - Accused-challan linking

### Reference Tables (2)
- **railway_posts** - Railway station master data
- **law_sections** - Legal section reference

### System Tables (3)
- **user_roles** - Role-based access control
- **activity_logs** - Audit trail

## 📈 Migration Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 19 |
| Total Indexes | 15+ |
| Total Triggers | 11 |
| Total Functions | 3 |
| Total Enums | 3 |
| Total RLS Policies | 50+ |
| Storage Buckets | 6 |
| SQL Scripts | 5 |
| Documentation Files | 3 |

## 🔐 Security Features

- ✅ Row-Level Security (RLS) on all tables
- ✅ Role-based access control (RBAC)
- ✅ Authenticated-only access
- ✅ User-specific data isolation
- ✅ Audit logging
- ✅ Secure file storage policies

## ⚙️ Supported Operations

### Schema
- ✅ Full schema replication
- ✅ Constraint preservation
- ✅ Index creation
- ✅ Trigger setup
- ✅ Function migration
- ✅ RLS policy setup

### Data
- ✅ Complete data export
- ✅ Ordered import (respects FK dependencies)
- ✅ NULL value handling
- ✅ JSONB data preservation
- ✅ Array data preservation
- ✅ Timestamp preservation

### Storage
- ✅ Bucket creation
- ✅ File migration support
- ✅ URL update scripts
- ✅ Access policy setup

## 🧪 Testing Checklist

After migration, verify:

- [ ] All tables exist (19 tables)
- [ ] All data imported (compare counts)
- [ ] Foreign keys intact (0 orphans)
- [ ] Indexes present
- [ ] Triggers functional
- [ ] Functions available
- [ ] RLS policies active
- [ ] Storage buckets created
- [ ] Files accessible
- [ ] Application connects
- [ ] User authentication works
- [ ] All features functional

## 🚨 Common Issues & Solutions

### Issue: "relation already exists"
**Solution:** Schema already created. Drop and recreate or skip.

### Issue: Foreign key violation
**Solution:** Check import order. Use provided scripts.

### Issue: RLS policy violation
**Solution:** Verify policies created. Check auth context.

### Issue: Storage files not accessible
**Solution:** Check bucket policies. Verify URLs updated.

### Issue: Connection refused
**Solution:** Verify connection string. Check firewall/network.

## 📞 Support Resources

- **README.md** - Detailed guide with troubleshooting
- **QUICK_START.md** - Quick reference and commands
- **Supabase Docs** - https://supabase.com/docs
- **PostgreSQL Docs** - https://www.postgresql.org/docs
- **Supabase Discord** - https://discord.supabase.com

## 🎓 Best Practices

1. **Always backup** before migration
2. **Test in staging** before production
3. **Run verification** after each phase
4. **Monitor closely** post-migration
5. **Keep old database** for 1-2 weeks
6. **Document changes** made during migration
7. **Update team** on new endpoints

## 📝 Notes

- Migration is non-destructive to source
- Scripts are idempotent (safe to re-run)
- Supports partial migration (run any phase independently)
- Works with any PostgreSQL-compatible database
- No application code changes required (only config)

## ✅ Success Criteria

Migration is successful when:
1. ✅ All verification checks pass
2. ✅ Application connects to new database
3. ✅ Users can authenticate
4. ✅ All CRUD operations work
5. ✅ Files are accessible
6. ✅ No errors in logs
7. ✅ Performance is acceptable

## 🎉 Ready to Migrate?

1. Start with **README.md** for detailed instructions
2. Use **QUICK_START.md** for quick reference
3. Run scripts in order: 01 → 02 → 03 → 04 → 06 → 05
4. Test thoroughly before going to production
5. Keep this INDEX.md as your navigation guide

**Good luck! 🚀**
