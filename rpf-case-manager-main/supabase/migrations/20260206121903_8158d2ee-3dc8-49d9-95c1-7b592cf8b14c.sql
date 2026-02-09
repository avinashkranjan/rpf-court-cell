-- Create enum types for the system
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'field_officer', 'court_admin');
CREATE TYPE public.case_status AS ENUM ('draft', 'in_progress', 'pending_approval', 'approved', 'forwarded_to_court', 'closed');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- User roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'field_officer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    belt_number TEXT,
    post_name TEXT NOT NULL,
    railway_zone TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Railway zones/posts lookup
CREATE TABLE public.railway_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,
    division TEXT NOT NULL,
    post_name TEXT NOT NULL,
    court_name TEXT,
    court_jurisdiction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.railway_posts ENABLE ROW LEVEL SECURITY;

-- Sections of law lookup
CREATE TABLE public.law_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_code TEXT NOT NULL UNIQUE,
    act_name TEXT NOT NULL,
    description TEXT,
    is_bailable BOOLEAN DEFAULT true,
    max_punishment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.law_sections ENABLE ROW LEVEL SECURITY;

-- Main cases table
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL UNIQUE,
    case_date DATE NOT NULL DEFAULT CURRENT_DATE,
    railway_zone TEXT NOT NULL,
    post_name TEXT NOT NULL,
    jurisdiction TEXT,
    section_of_law TEXT NOT NULL,
    incident_location TEXT NOT NULL,
    platform_number TEXT,
    station_name TEXT NOT NULL,
    train_number TEXT,
    train_name TEXT,
    coach_number TEXT,
    raid_start_time TIME,
    raid_end_time TIME,
    gd_entry_number TEXT,
    status case_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    court_name TEXT,
    court_production_date DATE,
    court_production_time TIME,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Officers involved in case
CREATE TABLE public.case_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    officer_id UUID REFERENCES auth.users(id),
    officer_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    role_in_case TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.case_officers ENABLE ROW LEVEL SECURITY;

-- Accused persons
CREATE TABLE public.accused (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender gender_type NOT NULL,
    date_of_birth DATE,
    mobile_number TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    village_town TEXT,
    post_office TEXT,
    police_station TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    photograph_url TEXT,
    identity_proof_type TEXT,
    identity_proof_number TEXT,
    identity_proof_url TEXT,
    has_valid_ticket BOOLEAN DEFAULT false,
    ticket_number TEXT,
    ticket_from TEXT,
    ticket_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.accused ENABLE ROW LEVEL SECURITY;

-- Step 1: Seizure Memo
CREATE TABLE public.seizure_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    seizure_date DATE NOT NULL,
    seizure_time TIME NOT NULL,
    seizure_place TEXT NOT NULL,
    witness1_name TEXT NOT NULL,
    witness1_address TEXT NOT NULL,
    witness1_signature TEXT,
    witness2_name TEXT NOT NULL,
    witness2_address TEXT NOT NULL,
    witness2_signature TEXT,
    seizing_officer_id UUID REFERENCES auth.users(id),
    seizing_officer_name TEXT NOT NULL,
    seizing_officer_designation TEXT NOT NULL,
    seizing_officer_signature TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.seizure_memos ENABLE ROW LEVEL SECURITY;

-- Seized items
CREATE TABLE public.seized_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seizure_memo_id UUID REFERENCES public.seizure_memos(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'nos',
    description TEXT,
    estimated_value DECIMAL(12,2),
    photo_url TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.seized_items ENABLE ROW LEVEL SECURITY;

-- Step 2: Arrest Memo (Annexure-A)
CREATE TABLE public.arrest_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    arrest_date DATE NOT NULL,
    arrest_time TIME NOT NULL,
    arrest_place TEXT NOT NULL,
    detention_place TEXT NOT NULL,
    gd_entry_number TEXT NOT NULL,
    vehicle_registration TEXT,
    court_name TEXT NOT NULL,
    court_production_date DATE NOT NULL,
    court_production_time TIME NOT NULL,
    arresting_officer_id UUID REFERENCES auth.users(id),
    arresting_officer_name TEXT NOT NULL,
    arresting_officer_designation TEXT NOT NULL,
    arresting_officer_signature TEXT,
    witness1_name TEXT NOT NULL,
    witness1_address TEXT NOT NULL,
    witness1_signature TEXT,
    witness2_name TEXT NOT NULL,
    witness2_address TEXT NOT NULL,
    witness2_signature TEXT,
    has_injuries BOOLEAN DEFAULT false,
    injury_details TEXT,
    accused_signature TEXT,
    accused_thumb_impression TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.arrest_memos ENABLE ROW LEVEL SECURITY;

-- Step 3: Personal Search Memo
CREATE TABLE public.personal_search_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    search_date DATE NOT NULL,
    search_time TIME NOT NULL,
    search_place TEXT NOT NULL,
    is_nil_search BOOLEAN DEFAULT false,
    cash_found DECIMAL(12,2) DEFAULT 0,
    articles_found TEXT,
    witness1_name TEXT NOT NULL,
    witness1_address TEXT NOT NULL,
    witness1_signature TEXT,
    witness2_name TEXT NOT NULL,
    witness2_address TEXT NOT NULL,
    witness2_signature TEXT,
    searching_officer_id UUID REFERENCES auth.users(id),
    searching_officer_name TEXT NOT NULL,
    searching_officer_designation TEXT NOT NULL,
    searching_officer_signature TEXT,
    accused_signature TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.personal_search_memos ENABLE ROW LEVEL SECURITY;

-- Personal search items found
CREATE TABLE public.personal_search_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_memo_id UUID REFERENCES public.personal_search_memos(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.personal_search_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Medical/Inspection Memo
CREATE TABLE public.medical_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    examination_date DATE NOT NULL,
    examination_time TIME NOT NULL,
    hospital_name TEXT NOT NULL,
    medical_officer_name TEXT NOT NULL,
    has_injuries BOOLEAN DEFAULT false,
    injury_description TEXT,
    fitness_status TEXT NOT NULL,
    medical_certificate_url TEXT,
    doctor_signature TEXT,
    remarks TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.medical_memos ENABLE ROW LEVEL SECURITY;

-- Step 5: BNSS Checklist
CREATE TABLE public.bnss_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    ground_a_prevent_offence BOOLEAN DEFAULT false,
    ground_b_proper_investigation BOOLEAN DEFAULT false,
    ground_c_evidence_protection BOOLEAN DEFAULT false,
    ground_d_prevent_inducement BOOLEAN DEFAULT false,
    ground_e_ensure_court_presence BOOLEAN DEFAULT false,
    officer_id UUID REFERENCES auth.users(id),
    officer_name TEXT NOT NULL,
    officer_designation TEXT NOT NULL,
    officer_signature TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bnss_checklists ENABLE ROW LEVEL SECURITY;

-- Step 6: Court Forwarding (Complaint-cum-PR Report)
CREATE TABLE public.court_forwardings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    railway_name TEXT NOT NULL,
    state_name TEXT NOT NULL,
    complainant_name TEXT NOT NULL,
    complainant_designation TEXT NOT NULL,
    raid_description TEXT NOT NULL,
    detection_details TEXT NOT NULL,
    offence_explanation TEXT NOT NULL,
    ticket_authority_logic TEXT,
    bail_status TEXT NOT NULL,
    bnss_references TEXT NOT NULL,
    prayer_for_cognizance TEXT NOT NULL,
    complainant_signature TEXT,
    forwarding_officer_name TEXT,
    forwarding_officer_designation TEXT,
    forwarding_officer_signature TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.court_forwardings ENABLE ROW LEVEL SECURITY;

-- Step 7: Accused Challan
CREATE TABLE public.accused_challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    challan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    court_name TEXT NOT NULL,
    escorting_officers TEXT,
    enclosures JSONB DEFAULT '[]'::jsonb,
    qr_code_data TEXT,
    is_completed BOOLEAN DEFAULT false,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.accused_challans ENABLE ROW LEVEL SECURITY;

-- Challan accused entries (multiple accused per challan)
CREATE TABLE public.challan_accused (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_id UUID REFERENCES public.accused_challans(id) ON DELETE CASCADE NOT NULL,
    accused_id UUID REFERENCES public.accused(id) ON DELETE CASCADE NOT NULL,
    sl_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.challan_accused ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to generate case number
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SPLIT_PART(case_number, '/', 2) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.cases
    WHERE case_number LIKE 'RPF/HWC/%/' || year_part;
    
    NEW.case_number := 'RPF/HWC/' || sequence_num || '/' || year_part;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_case_number
BEFORE INSERT ON public.cases
FOR EACH ROW
WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
EXECUTE FUNCTION public.generate_case_number();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'field_officer');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accused_updated_at BEFORE UPDATE ON public.accused FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seizure_memos_updated_at BEFORE UPDATE ON public.seizure_memos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_arrest_memos_updated_at BEFORE UPDATE ON public.arrest_memos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personal_search_memos_updated_at BEFORE UPDATE ON public.personal_search_memos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_memos_updated_at BEFORE UPDATE ON public.medical_memos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bnss_checklists_updated_at BEFORE UPDATE ON public.bnss_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_court_forwardings_updated_at BEFORE UPDATE ON public.court_forwardings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accused_challans_updated_at BEFORE UPDATE ON public.accused_challans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Railway posts policies (public read)
CREATE POLICY "Anyone can view railway posts" ON public.railway_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage railway posts" ON public.railway_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Law sections policies (public read)
CREATE POLICY "Anyone can view law sections" ON public.law_sections FOR SELECT USING (true);
CREATE POLICY "Admins can manage law sections" ON public.law_sections FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cases policies
CREATE POLICY "Users can view all cases" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Officers can create cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Officers can update own cases" ON public.cases FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Case officers policies
CREATE POLICY "Users can view case officers" ON public.case_officers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage case officers" ON public.case_officers FOR ALL TO authenticated USING (true);

-- Accused policies
CREATE POLICY "Users can view accused" ON public.accused FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage accused" ON public.accused FOR ALL TO authenticated USING (true);

-- Seizure memos policies
CREATE POLICY "Users can view seizure memos" ON public.seizure_memos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage seizure memos" ON public.seizure_memos FOR ALL TO authenticated USING (true);

-- Seized items policies
CREATE POLICY "Users can view seized items" ON public.seized_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage seized items" ON public.seized_items FOR ALL TO authenticated USING (true);

-- Arrest memos policies
CREATE POLICY "Users can view arrest memos" ON public.arrest_memos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage arrest memos" ON public.arrest_memos FOR ALL TO authenticated USING (true);

-- Personal search memos policies
CREATE POLICY "Users can view personal search memos" ON public.personal_search_memos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage personal search memos" ON public.personal_search_memos FOR ALL TO authenticated USING (true);

-- Personal search items policies
CREATE POLICY "Users can view personal search items" ON public.personal_search_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage personal search items" ON public.personal_search_items FOR ALL TO authenticated USING (true);

-- Medical memos policies
CREATE POLICY "Users can view medical memos" ON public.medical_memos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage medical memos" ON public.medical_memos FOR ALL TO authenticated USING (true);

-- BNSS checklists policies
CREATE POLICY "Users can view bnss checklists" ON public.bnss_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage bnss checklists" ON public.bnss_checklists FOR ALL TO authenticated USING (true);

-- Court forwardings policies
CREATE POLICY "Users can view court forwardings" ON public.court_forwardings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage court forwardings" ON public.court_forwardings FOR ALL TO authenticated USING (true);

-- Accused challans policies
CREATE POLICY "Users can view accused challans" ON public.accused_challans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage accused challans" ON public.accused_challans FOR ALL TO authenticated USING (true);

-- Challan accused policies
CREATE POLICY "Users can view challan accused" ON public.challan_accused FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage challan accused" ON public.challan_accused FOR ALL TO authenticated USING (true);

-- Insert default railway posts
INSERT INTO public.railway_posts (zone_name, division, post_name, court_name, court_jurisdiction) VALUES
('Eastern Railway', 'Howrah', 'RPF/Post/HWH Central', 'Ld. RJM/Howrah', 'Howrah'),
('Eastern Railway', 'Howrah', 'RPF/Post/HWH Old Complex', 'Ld. RJM/Howrah', 'Howrah'),
('Eastern Railway', 'Sealdah', 'RPF/Post/Sealdah', 'Ld. RJM/Sealdah', 'Sealdah');

-- Insert default law sections
INSERT INTO public.law_sections (section_code, act_name, description, is_bailable, max_punishment) VALUES
('145(b)', 'Railway Act 1989', 'Travelling without ticket or with invalid ticket', true, 'Fine up to Rs. 500'),
('155(i)b', 'Railway Act 1989', 'Travelling in reserved compartment without authority', true, 'Fine up to Rs. 500'),
('137', 'Railway Act 1989', 'Penalty for begging', true, 'Fine up to Rs. 250'),
('144', 'Railway Act 1989', 'Penalty for travelling on roof, step or engine', true, 'Fine up to Rs. 2000'),
('147', 'Railway Act 1989', 'Penalty for travelling without pass', true, 'Fine up to Rs. 500'),
('159', 'Railway Act 1989', 'Penalty for smoking in railway premises', true, 'Fine up to Rs. 200');