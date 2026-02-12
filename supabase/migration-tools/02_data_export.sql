-- =====================================================================
-- RPF Court Cell - Data Export Script
-- Export data from Lovable Supabase to SQL format
-- =====================================================================
-- This script generates SQL COPY commands to export data from all tables
-- Run this in your SOURCE (Lovable Supabase) database
-- =====================================================================

-- Set output format for data export
\pset format unaligned
\pset fieldsep '\t'
\pset footer off

-- =====================================================================
-- EXPORT ORDER (respecting foreign key dependencies)
-- =====================================================================
-- 1. Master/Reference tables (no dependencies)
-- 2. User and auth tables
-- 3. Cases table
-- 4. Tables dependent on cases
-- 5. Child tables with multiple levels
-- =====================================================================

-- Output instructions
\echo '======================================================================'
\echo 'RPF Court Cell - Data Export'
\echo 'This will export data to CSV/TSV files in the correct order'
\echo '======================================================================'

-- Export profiles (depends on auth.users, but we can't export that)
\echo 'Exporting profiles...'
\copy (SELECT * FROM profiles ORDER BY created_at) TO 'export_data/01_profiles.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export user_roles
\echo 'Exporting user_roles...'
\copy (SELECT * FROM user_roles ORDER BY assigned_at) TO 'export_data/02_user_roles.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export railway_posts
\echo 'Exporting railway_posts...'
\copy (SELECT * FROM railway_posts ORDER BY created_at) TO 'export_data/03_railway_posts.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export law_sections
\echo 'Exporting law_sections...'
\copy (SELECT * FROM law_sections ORDER BY created_at) TO 'export_data/04_law_sections.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export cases
\echo 'Exporting cases...'
\copy (SELECT * FROM cases ORDER BY created_at) TO 'export_data/05_cases.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export case_officers
\echo 'Exporting case_officers...'
\copy (SELECT * FROM case_officers ORDER BY assigned_at) TO 'export_data/06_case_officers.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export accused
\echo 'Exporting accused...'
\copy (SELECT * FROM accused ORDER BY created_at) TO 'export_data/07_accused.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export arrest_memos
\echo 'Exporting arrest_memos...'
\copy (SELECT * FROM arrest_memos ORDER BY created_at) TO 'export_data/08_arrest_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export bnss_checklists
\echo 'Exporting bnss_checklists...'
\copy (SELECT * FROM bnss_checklists ORDER BY created_at) TO 'export_data/09_bnss_checklists.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export seizure_memos
\echo 'Exporting seizure_memos...'
\copy (SELECT * FROM seizure_memos ORDER BY created_at) TO 'export_data/10_seizure_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export seized_items
\echo 'Exporting seized_items...'
\copy (SELECT * FROM seized_items ORDER BY created_at) TO 'export_data/11_seized_items.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export personal_search_memos
\echo 'Exporting personal_search_memos...'
\copy (SELECT * FROM personal_search_memos ORDER BY created_at) TO 'export_data/12_personal_search_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export personal_search_items
\echo 'Exporting personal_search_items...'
\copy (SELECT * FROM personal_search_items ORDER BY created_at) TO 'export_data/13_personal_search_items.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export medical_memos
\echo 'Exporting medical_memos...'
\copy (SELECT * FROM medical_memos ORDER BY created_at) TO 'export_data/14_medical_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export court_forwardings
\echo 'Exporting court_forwardings...'
\copy (SELECT * FROM court_forwardings ORDER BY created_at) TO 'export_data/15_court_forwardings.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export accused_challans
\echo 'Exporting accused_challans...'
\copy (SELECT * FROM accused_challans ORDER BY created_at) TO 'export_data/16_accused_challans.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export challan_accused
\echo 'Exporting challan_accused...'
\copy (SELECT * FROM challan_accused ORDER BY created_at) TO 'export_data/17_challan_accused.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export activity_logs
\echo 'Exporting activity_logs...'
\copy (SELECT * FROM activity_logs ORDER BY timestamp) TO 'export_data/18_activity_logs.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Export statistics
\echo '======================================================================'
\echo 'Export Statistics:'
\echo '======================================================================'
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'railway_posts', COUNT(*) FROM railway_posts
UNION ALL
SELECT 'law_sections', COUNT(*) FROM law_sections
UNION ALL
SELECT 'cases', COUNT(*) FROM cases
UNION ALL
SELECT 'case_officers', COUNT(*) FROM case_officers
UNION ALL
SELECT 'accused', COUNT(*) FROM accused
UNION ALL
SELECT 'arrest_memos', COUNT(*) FROM arrest_memos
UNION ALL
SELECT 'bnss_checklists', COUNT(*) FROM bnss_checklists
UNION ALL
SELECT 'seizure_memos', COUNT(*) FROM seizure_memos
UNION ALL
SELECT 'seized_items', COUNT(*) FROM seized_items
UNION ALL
SELECT 'personal_search_memos', COUNT(*) FROM personal_search_memos
UNION ALL
SELECT 'personal_search_items', COUNT(*) FROM personal_search_items
UNION ALL
SELECT 'medical_memos', COUNT(*) FROM medical_memos
UNION ALL
SELECT 'court_forwardings', COUNT(*) FROM court_forwardings
UNION ALL
SELECT 'accused_challans', COUNT(*) FROM accused_challans
UNION ALL
SELECT 'challan_accused', COUNT(*) FROM challan_accused
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs;

\echo '======================================================================'
\echo 'Data export complete!'
\echo 'Files are saved in the export_data/ directory'
\echo 'Next step: Run 03_data_import.sql on your target database'
\echo '======================================================================'
