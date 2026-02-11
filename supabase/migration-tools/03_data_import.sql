-- =====================================================================
-- RPF Court Cell - Data Import Script
-- Import data from TSV files into Self-Hosted Supabase
-- =====================================================================
-- This script imports data exported from Lovable Supabase
-- Run this in your TARGET (Self-Hosted Supabase) database
-- IMPORTANT: Run 01_complete_schema.sql FIRST before running this
-- =====================================================================

-- Disable triggers temporarily to avoid conflicts during bulk import
SET session_replication_role = replica;

\echo '======================================================================'
\echo 'RPF Court Cell - Data Import'
\echo 'Importing data from TSV files...'
\echo '======================================================================'

-- =====================================================================
-- IMPORT ORDER (same as export order - respects foreign keys)
-- =====================================================================

-- Import profiles
\echo 'Importing profiles...'
\copy profiles FROM 'export_data/01_profiles.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import user_roles
\echo 'Importing user_roles...'
\copy user_roles FROM 'export_data/02_user_roles.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import railway_posts
\echo 'Importing railway_posts...'
\copy railway_posts FROM 'export_data/03_railway_posts.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import law_sections
\echo 'Importing law_sections...'
\copy law_sections FROM 'export_data/04_law_sections.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import cases
\echo 'Importing cases...'
\copy cases FROM 'export_data/05_cases.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import case_officers
\echo 'Importing case_officers...'
\copy case_officers FROM 'export_data/06_case_officers.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import accused
\echo 'Importing accused...'
\copy accused FROM 'export_data/07_accused.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import arrest_memos
\echo 'Importing arrest_memos...'
\copy arrest_memos FROM 'export_data/08_arrest_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import bnss_checklists
\echo 'Importing bnss_checklists...'
\copy bnss_checklists FROM 'export_data/09_bnss_checklists.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import seizure_memos
\echo 'Importing seizure_memos...'
\copy seizure_memos FROM 'export_data/10_seizure_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import seized_items
\echo 'Importing seized_items...'
\copy seized_items FROM 'export_data/11_seized_items.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import personal_search_memos
\echo 'Importing personal_search_memos...'
\copy personal_search_memos FROM 'export_data/12_personal_search_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import personal_search_items
\echo 'Importing personal_search_items...'
\copy personal_search_items FROM 'export_data/13_personal_search_items.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import medical_memos
\echo 'Importing medical_memos...'
\copy medical_memos FROM 'export_data/14_medical_memos.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import court_forwardings
\echo 'Importing court_forwardings...'
\copy court_forwardings FROM 'export_data/15_court_forwardings.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import accused_challans
\echo 'Importing accused_challans...'
\copy accused_challans FROM 'export_data/16_accused_challans.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import challan_accused
\echo 'Importing challan_accused...'
\copy challan_accused FROM 'export_data/17_challan_accused.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Import activity_logs
\echo 'Importing activity_logs...'
\copy activity_logs FROM 'export_data/18_activity_logs.tsv' WITH (FORMAT CSV, HEADER, DELIMITER E'\t', NULL '\\N');

-- Re-enable triggers
SET session_replication_role = DEFAULT;

\echo '======================================================================'
\echo 'Verifying import...'
\echo '======================================================================'

-- Verify record counts
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
\echo 'Data import complete!'
\echo 'Compare the counts above with your source database'
\echo 'Next step: Run 04_verify_migration.sql to validate data integrity'
\echo '======================================================================'
