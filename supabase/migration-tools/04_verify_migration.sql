-- =====================================================================
-- RPF Court Cell - Migration Verification Script
-- Verify data integrity and relationships after migration
-- =====================================================================
-- Run this in your TARGET (Self-Hosted Supabase) database
-- =====================================================================

\echo '======================================================================'
\echo 'RPF Court Cell - Migration Verification'
\echo 'Checking data integrity and foreign key relationships...'
\echo '======================================================================'

-- =====================================================================
-- 1. Check Table Existence
-- =====================================================================
\echo ''
\echo '1. Verifying all tables exist...'
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM (
  VALUES 
    ('profiles'),
    ('user_roles'),
    ('railway_posts'),
    ('law_sections'),
    ('cases'),
    ('case_officers'),
    ('accused'),
    ('arrest_memos'),
    ('bnss_checklists'),
    ('seizure_memos'),
    ('seized_items'),
    ('personal_search_memos'),
    ('personal_search_items'),
    ('medical_memos'),
    ('court_forwardings'),
    ('accused_challans'),
    ('challan_accused'),
    ('activity_logs')
) AS expected_tables(table_name)
ORDER BY table_name;

-- =====================================================================
-- 2. Check Record Counts
-- =====================================================================
\echo ''
\echo '2. Record counts per table...'
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'railway_posts', COUNT(*) FROM railway_posts
UNION ALL SELECT 'law_sections', COUNT(*) FROM law_sections
UNION ALL SELECT 'cases', COUNT(*) FROM cases
UNION ALL SELECT 'case_officers', COUNT(*) FROM case_officers
UNION ALL SELECT 'accused', COUNT(*) FROM accused
UNION ALL SELECT 'arrest_memos', COUNT(*) FROM arrest_memos
UNION ALL SELECT 'bnss_checklists', COUNT(*) FROM bnss_checklists
UNION ALL SELECT 'seizure_memos', COUNT(*) FROM seizure_memos
UNION ALL SELECT 'seized_items', COUNT(*) FROM seized_items
UNION ALL SELECT 'personal_search_memos', COUNT(*) FROM personal_search_memos
UNION ALL SELECT 'personal_search_items', COUNT(*) FROM personal_search_items
UNION ALL SELECT 'medical_memos', COUNT(*) FROM medical_memos
UNION ALL SELECT 'court_forwardings', COUNT(*) FROM court_forwardings
UNION ALL SELECT 'accused_challans', COUNT(*) FROM accused_challans
UNION ALL SELECT 'challan_accused', COUNT(*) FROM challan_accused
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
ORDER BY table_name;

-- =====================================================================
-- 3. Check Foreign Key Integrity
-- =====================================================================
\echo ''
\echo '3. Checking foreign key integrity...'

-- Check cases.created_by references profiles
\echo '   - Checking cases.created_by → profiles.id'
SELECT 
  'cases.created_by' as foreign_key,
  COUNT(*) as orphaned_records
FROM cases c
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = c.created_by);

-- Check accused.case_id references cases
\echo '   - Checking accused.case_id → cases.id'
SELECT 
  'accused.case_id' as foreign_key,
  COUNT(*) as orphaned_records
FROM accused a
WHERE NOT EXISTS (SELECT 1 FROM cases c WHERE c.id = a.case_id);

-- Check arrest_memos foreign keys
\echo '   - Checking arrest_memos.case_id → cases.id'
SELECT 
  'arrest_memos.case_id' as foreign_key,
  COUNT(*) as orphaned_records
FROM arrest_memos am
WHERE NOT EXISTS (SELECT 1 FROM cases c WHERE c.id = am.case_id);

\echo '   - Checking arrest_memos.accused_id → accused.id'
SELECT 
  'arrest_memos.accused_id' as foreign_key,
  COUNT(*) as orphaned_records
FROM arrest_memos am
WHERE NOT EXISTS (SELECT 1 FROM accused a WHERE a.id = am.accused_id);

-- Check seizure_memos foreign keys
\echo '   - Checking seizure_memos.case_id → cases.id'
SELECT 
  'seizure_memos.case_id' as foreign_key,
  COUNT(*) as orphaned_records
FROM seizure_memos sm
WHERE NOT EXISTS (SELECT 1 FROM cases c WHERE c.id = sm.case_id);

-- Check seized_items foreign keys
\echo '   - Checking seized_items.seizure_memo_id → seizure_memos.id'
SELECT 
  'seized_items.seizure_memo_id' as foreign_key,
  COUNT(*) as orphaned_records
FROM seized_items si
WHERE NOT EXISTS (SELECT 1 FROM seizure_memos sm WHERE sm.id = si.seizure_memo_id);

-- =====================================================================
-- 4. Check Data Quality
-- =====================================================================
\echo ''
\echo '4. Checking data quality...'

-- Check for NULL values in required fields
\echo '   - Checking for NULL values in critical fields'
SELECT 
  'cases.case_number NULL' as issue,
  COUNT(*) as count
FROM cases WHERE case_number IS NULL
UNION ALL
SELECT 
  'accused.full_name NULL',
  COUNT(*)
FROM accused WHERE full_name IS NULL
UNION ALL
SELECT 
  'profiles.full_name NULL',
  COUNT(*)
FROM profiles WHERE full_name IS NULL;

-- Check case status distribution
\echo ''
\echo '   - Case status distribution'
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cases), 2) as percentage
FROM cases
GROUP BY status
ORDER BY count DESC;

-- =====================================================================
-- 5. Check Indexes
-- =====================================================================
\echo ''
\echo '5. Verifying indexes exist...'
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'cases', 'accused', 'arrest_memos', 
    'seizure_memos', 'case_officers', 'activity_logs'
  )
ORDER BY tablename, indexname;

-- =====================================================================
-- 6. Check Triggers
-- =====================================================================
\echo ''
\echo '6. Verifying triggers exist...'
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================================
-- 7. Check Functions
-- =====================================================================
\echo ''
\echo '7. Verifying functions exist...'
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('has_role', 'handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;

-- =====================================================================
-- 8. Check RLS Policies
-- =====================================================================
\echo ''
\echo '8. Verifying RLS policies...'
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Detailed policy list
\echo ''
\echo '   - Detailed RLS policies'
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================================
-- 9. Sample Data Verification
-- =====================================================================
\echo ''
\echo '9. Sample data verification...'

-- Show sample cases
\echo '   - Sample cases (first 5)'
SELECT 
  case_number,
  railway_zone,
  status,
  incident_date,
  created_at
FROM cases
ORDER BY created_at DESC
LIMIT 5;

-- Show sample accused
\echo ''
\echo '   - Sample accused (first 5)'
SELECT 
  full_name,
  age,
  gender,
  district,
  state,
  created_at
FROM accused
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================================
-- 10. Summary
-- =====================================================================
\echo ''
\echo '======================================================================'
\echo 'Migration Verification Complete!'
\echo '======================================================================'
\echo ''
\echo 'Review the results above:'
\echo '  - All tables should exist (✓ EXISTS)'
\echo '  - Orphaned records count should be 0'
\echo '  - NULL values in critical fields should be 0'
\echo '  - Indexes, triggers, functions, and RLS policies should be present'
\echo ''
\echo 'If any issues are found, review and re-run the migration scripts.'
\echo '======================================================================'
