-- =====================================================================
-- RPF Court Cell - Complete Database Schema
-- Migration from Lovable Supabase to Self-Hosted Supabase
-- =====================================================================
-- This script creates the complete database schema including:
-- - All tables with proper columns and constraints
-- - Custom types and enums
-- - Database functions
-- - Row-Level Security (RLS) policies
-- - Triggers and automation
-- =====================================================================

-- =====================================================================
-- STEP 1: Create Custom Types and Enums
-- =====================================================================

-- Enum for user roles
CREATE TYPE app_role AS ENUM (
  'admin',
  'supervisor', 
  'field_officer',
  'court_admin'
);

-- Enum for case workflow status
CREATE TYPE case_status AS ENUM (
  'draft',
  'in_progress',
  'pending_approval',
  'approved',
  'forwarded_to_court',
  'closed'
);

-- Enum for gender
CREATE TYPE gender_type AS ENUM (
  'male',
  'female',
  'other'
);

-- =====================================================================
-- STEP 2: Create Main Tables
-- =====================================================================

-- Profiles table (user officer information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  post_name TEXT NOT NULL,
  railway_zone TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, role)
);

-- Railway posts master data
CREATE TABLE IF NOT EXISTS railway_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_name TEXT NOT NULL,
  railway_zone TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  court_station TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_name, railway_zone)
);

-- Law sections reference
CREATE TABLE IF NOT EXISTS law_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number TEXT NOT NULL,
  act_name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_bailable BOOLEAN DEFAULT false,
  min_punishment TEXT,
  max_punishment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_number, act_name)
);

-- Cases table (core case records)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  railway_zone TEXT NOT NULL,
  post_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_time TEXT NOT NULL,
  incident_location TEXT NOT NULL,
  brief_facts TEXT NOT NULL,
  sections_of_law TEXT[] NOT NULL,
  status case_status DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id)
);

-- Case officers (many-to-many relationship)
CREATE TABLE IF NOT EXISTS case_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, officer_id)
);

-- Accused persons
CREATE TABLE IF NOT EXISTS accused (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  date_of_birth DATE,
  gender gender_type NOT NULL,
  mobile_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  village_town TEXT,
  police_station TEXT,
  post_office TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  identity_proof_type TEXT,
  identity_proof_number TEXT,
  identity_proof_url TEXT,
  photograph_url TEXT,
  has_valid_ticket BOOLEAN,
  ticket_number TEXT,
  ticket_from TEXT,
  ticket_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arrest memos
CREATE TABLE IF NOT EXISTS arrest_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  arrest_date TIMESTAMPTZ NOT NULL,
  arrest_time TEXT NOT NULL,
  arrest_location TEXT NOT NULL,
  arresting_officer TEXT NOT NULL,
  arresting_officer_designation TEXT NOT NULL,
  witness1_name TEXT NOT NULL,
  witness1_address TEXT NOT NULL,
  witness2_name TEXT,
  witness2_address TEXT,
  grounds_of_arrest TEXT NOT NULL,
  visible_injuries TEXT,
  injuries_noted BOOLEAN DEFAULT false,
  medical_examination_required BOOLEAN DEFAULT false,
  detention_place TEXT NOT NULL,
  detention_time TEXT NOT NULL,
  informant_name TEXT NOT NULL,
  informant_relation TEXT NOT NULL,
  informant_notified_at TIMESTAMPTZ,
  arresting_officer_signature TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BNSS compliance checklists
CREATE TABLE IF NOT EXISTS bnss_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  grounds JSONB NOT NULL,
  verification_officer TEXT NOT NULL,
  verification_date TIMESTAMPTZ NOT NULL,
  all_grounds_met BOOLEAN NOT NULL,
  remarks TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seizure memos
CREATE TABLE IF NOT EXISTS seizure_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  seizure_date TIMESTAMPTZ NOT NULL,
  seizure_time TEXT NOT NULL,
  seizure_location TEXT NOT NULL,
  seizing_officer TEXT NOT NULL,
  seizing_officer_designation TEXT NOT NULL,
  witness1_name TEXT NOT NULL,
  witness1_address TEXT NOT NULL,
  witness2_name TEXT,
  witness2_address TEXT,
  total_estimated_value NUMERIC(12,2),
  seizing_officer_signature TEXT,
  witness1_signature TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seized items (line items for seizure memos)
CREATE TABLE IF NOT EXISTS seized_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seizure_memo_id UUID NOT NULL REFERENCES seizure_memos(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  estimated_value NUMERIC(10,2),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal search memos
CREATE TABLE IF NOT EXISTS personal_search_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  search_date TIMESTAMPTZ NOT NULL,
  search_time TEXT NOT NULL,
  search_location TEXT NOT NULL,
  searching_officer TEXT NOT NULL,
  searching_officer_designation TEXT NOT NULL,
  witness1_name TEXT NOT NULL,
  witness1_address TEXT NOT NULL,
  witness2_name TEXT,
  witness2_address TEXT,
  items_found BOOLEAN NOT NULL,
  nil_search BOOLEAN DEFAULT false,
  searching_officer_signature TEXT,
  witness1_signature TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal search items
CREATE TABLE IF NOT EXISTS personal_search_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_search_memo_id UUID NOT NULL REFERENCES personal_search_memos(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical memos
CREATE TABLE IF NOT EXISTS medical_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  arrest_date TIMESTAMPTZ NOT NULL,
  arrest_time TEXT NOT NULL,
  arrest_location TEXT NOT NULL,
  medical_examination_date TIMESTAMPTZ NOT NULL,
  medical_officer_name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  injuries_noted TEXT,
  medical_remarks TEXT,
  medical_certificate_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Court forwarding documents
CREATE TABLE IF NOT EXISTS court_forwardings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  forwarding_date TIMESTAMPTZ NOT NULL,
  court_name TEXT NOT NULL,
  complainant_name TEXT NOT NULL,
  complainant_designation TEXT NOT NULL,
  prosecutor_name TEXT NOT NULL,
  brief_narrative TEXT NOT NULL,
  enclosures JSONB,
  bail_status TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accused challans (prosecution documents)
CREATE TABLE IF NOT EXISTS accused_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  challan_number TEXT NOT NULL UNIQUE,
  court_name TEXT NOT NULL,
  generation_date TIMESTAMPTZ NOT NULL,
  qr_code TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challan accused (many-to-many linking)
CREATE TABLE IF NOT EXISTS challan_accused (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID NOT NULL REFERENCES accused_challans(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES accused(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challan_id, accused_id)
);

-- Activity logs (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- STEP 3: Create Indexes for Performance
-- =====================================================================

-- Cases indexes
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_incident_date ON cases(incident_date);

-- Accused indexes
CREATE INDEX idx_accused_case_id ON accused(case_id);
CREATE INDEX idx_accused_full_name ON accused(full_name);
CREATE INDEX idx_accused_mobile_number ON accused(mobile_number);

-- Case officers indexes
CREATE INDEX idx_case_officers_case_id ON case_officers(case_id);
CREATE INDEX idx_case_officers_officer_id ON case_officers(officer_id);

-- Document indexes
CREATE INDEX idx_arrest_memos_case_id ON arrest_memos(case_id);
CREATE INDEX idx_arrest_memos_accused_id ON arrest_memos(accused_id);
CREATE INDEX idx_seizure_memos_case_id ON seizure_memos(case_id);
CREATE INDEX idx_personal_search_memos_case_id ON personal_search_memos(case_id);
CREATE INDEX idx_medical_memos_case_id ON medical_memos(case_id);
CREATE INDEX idx_court_forwardings_case_id ON court_forwardings(case_id);

-- Activity logs index
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =====================================================================
-- STEP 4: Create Database Functions
-- =====================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(
  user_id UUID,
  role app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role = $2
  );
END;
$$;

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, designation, post_name, railway_zone, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Pending'),
    COALESCE(NEW.raw_user_meta_data->>'post_name', 'Pending'),
    COALESCE(NEW.raw_user_meta_data->>'railway_zone', 'Pending'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- STEP 5: Create Triggers
-- =====================================================================

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accused_updated_at BEFORE UPDATE ON accused
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arrest_memos_updated_at BEFORE UPDATE ON arrest_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seizure_memos_updated_at BEFORE UPDATE ON seizure_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_search_memos_updated_at BEFORE UPDATE ON personal_search_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_memos_updated_at BEFORE UPDATE ON medical_memos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_forwardings_updated_at BEFORE UPDATE ON court_forwardings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accused_challans_updated_at BEFORE UPDATE ON accused_challans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_railway_posts_updated_at BEFORE UPDATE ON railway_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- STEP 6: Enable Row Level Security (RLS)
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE railway_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accused ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrest_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bnss_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE seizure_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seized_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_search_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_search_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_forwardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accused_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE challan_accused ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 7: Create RLS Policies
-- =====================================================================

-- Profiles policies
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read for own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable read for all authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User roles policies (admin only)
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Railway posts policies (read for all authenticated)
CREATE POLICY "Authenticated users can read railway posts" ON railway_posts
  FOR SELECT TO authenticated
  USING (true);

-- Law sections policies (read for all authenticated)
CREATE POLICY "Authenticated users can read law sections" ON law_sections
  FOR SELECT TO authenticated
  USING (true);

-- Cases policies (field officers and above can access)
CREATE POLICY "Authenticated users can read cases" ON cases
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Field officers can create cases" ON cases
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Case creators and officers can update cases" ON cases
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM case_officers WHERE case_id = cases.id AND officer_id = auth.uid())
  );

-- Case officers policies
CREATE POLICY "Authenticated users can read case officers" ON case_officers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Case creators can manage case officers" ON case_officers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = case_officers.case_id AND cases.created_by = auth.uid())
  );

-- Accused policies
CREATE POLICY "Authenticated users can read accused" ON accused
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Case officers can manage accused" ON accused
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = accused.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

-- Document policies (arrest memos, seizure memos, etc.)
-- All authenticated users can read, but only case officers can create/update

CREATE POLICY "Authenticated users can read arrest memos" ON arrest_memos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Case officers can manage arrest memos" ON arrest_memos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = arrest_memos.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

-- Similar policies for other document tables
CREATE POLICY "Authenticated users can read seizure memos" ON seizure_memos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage seizure memos" ON seizure_memos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = seizure_memos.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read seized items" ON seized_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage seized items" ON seized_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM seizure_memos 
      JOIN cases ON seizure_memos.case_id = cases.id
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE seizure_memos.id = seized_items.seizure_memo_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read personal search memos" ON personal_search_memos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage personal search memos" ON personal_search_memos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = personal_search_memos.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read personal search items" ON personal_search_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage personal search items" ON personal_search_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM personal_search_memos 
      JOIN cases ON personal_search_memos.case_id = cases.id
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE personal_search_memos.id = personal_search_items.personal_search_memo_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read medical memos" ON medical_memos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage medical memos" ON medical_memos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = medical_memos.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read bnss checklists" ON bnss_checklists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage bnss checklists" ON bnss_checklists
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = bnss_checklists.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read court forwardings" ON court_forwardings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage court forwardings" ON court_forwardings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = court_forwardings.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read accused challans" ON accused_challans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage accused challans" ON accused_challans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE cases.id = accused_challans.case_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can read challan accused" ON challan_accused
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Case officers can manage challan accused" ON challan_accused
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accused_challans 
      JOIN cases ON accused_challans.case_id = cases.id
      LEFT JOIN case_officers ON cases.id = case_officers.case_id
      WHERE accused_challans.id = challan_accused.challan_id 
      AND (cases.created_by = auth.uid() OR case_officers.officer_id = auth.uid())
    )
  );

-- Activity logs policies (users can read their own logs, admins can read all)
CREATE POLICY "Users can read own activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next Steps:
-- 1. Run the data export script to dump data from source database
-- 2. Run the data import script to load data into this database
-- 3. Verify data integrity and relationships
-- 4. Configure storage buckets for file uploads
-- 5. Update application environment variables
-- =====================================================================
