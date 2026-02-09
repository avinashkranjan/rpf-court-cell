export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accused: {
        Row: {
          address_line1: string
          address_line2: string | null
          age: number
          case_id: string
          created_at: string | null
          date_of_birth: string | null
          district: string
          father_name: string
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          has_valid_ticket: boolean | null
          id: string
          identity_proof_number: string | null
          identity_proof_type: string | null
          identity_proof_url: string | null
          mobile_number: string | null
          photograph_url: string | null
          pincode: string | null
          police_station: string | null
          post_office: string | null
          state: string
          ticket_from: string | null
          ticket_number: string | null
          ticket_to: string | null
          updated_at: string | null
          village_town: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          age: number
          case_id: string
          created_at?: string | null
          date_of_birth?: string | null
          district: string
          father_name: string
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          has_valid_ticket?: boolean | null
          id?: string
          identity_proof_number?: string | null
          identity_proof_type?: string | null
          identity_proof_url?: string | null
          mobile_number?: string | null
          photograph_url?: string | null
          pincode?: string | null
          police_station?: string | null
          post_office?: string | null
          state: string
          ticket_from?: string | null
          ticket_number?: string | null
          ticket_to?: string | null
          updated_at?: string | null
          village_town?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          age?: number
          case_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          district?: string
          father_name?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          has_valid_ticket?: boolean | null
          id?: string
          identity_proof_number?: string | null
          identity_proof_type?: string | null
          identity_proof_url?: string | null
          mobile_number?: string | null
          photograph_url?: string | null
          pincode?: string | null
          police_station?: string | null
          post_office?: string | null
          state?: string
          ticket_from?: string | null
          ticket_number?: string | null
          ticket_to?: string | null
          updated_at?: string | null
          village_town?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accused_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      accused_challans: {
        Row: {
          case_id: string
          challan_date: string
          court_name: string
          created_at: string | null
          enclosures: Json | null
          escorting_officers: string | null
          id: string
          is_completed: boolean | null
          pdf_url: string | null
          qr_code_data: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          challan_date?: string
          court_name: string
          created_at?: string | null
          enclosures?: Json | null
          escorting_officers?: string | null
          id?: string
          is_completed?: boolean | null
          pdf_url?: string | null
          qr_code_data?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          challan_date?: string
          court_name?: string
          created_at?: string | null
          enclosures?: Json | null
          escorting_officers?: string | null
          id?: string
          is_completed?: boolean | null
          pdf_url?: string | null
          qr_code_data?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accused_challans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      arrest_memos: {
        Row: {
          accused_id: string
          accused_signature: string | null
          accused_thumb_impression: string | null
          arrest_date: string
          arrest_place: string
          arrest_time: string
          arresting_officer_designation: string
          arresting_officer_id: string | null
          arresting_officer_name: string
          arresting_officer_signature: string | null
          case_id: string
          court_name: string
          court_production_date: string
          court_production_time: string
          created_at: string | null
          detention_place: string
          gd_entry_number: string
          has_injuries: boolean | null
          id: string
          injury_details: string | null
          is_completed: boolean | null
          pdf_url: string | null
          updated_at: string | null
          vehicle_registration: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature: string | null
        }
        Insert: {
          accused_id: string
          accused_signature?: string | null
          accused_thumb_impression?: string | null
          arrest_date: string
          arrest_place: string
          arrest_time: string
          arresting_officer_designation: string
          arresting_officer_id?: string | null
          arresting_officer_name: string
          arresting_officer_signature?: string | null
          case_id: string
          court_name: string
          court_production_date: string
          court_production_time: string
          created_at?: string | null
          detention_place: string
          gd_entry_number: string
          has_injuries?: boolean | null
          id?: string
          injury_details?: string | null
          is_completed?: boolean | null
          pdf_url?: string | null
          updated_at?: string | null
          vehicle_registration?: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature?: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature?: string | null
        }
        Update: {
          accused_id?: string
          accused_signature?: string | null
          accused_thumb_impression?: string | null
          arrest_date?: string
          arrest_place?: string
          arrest_time?: string
          arresting_officer_designation?: string
          arresting_officer_id?: string | null
          arresting_officer_name?: string
          arresting_officer_signature?: string | null
          case_id?: string
          court_name?: string
          court_production_date?: string
          court_production_time?: string
          created_at?: string | null
          detention_place?: string
          gd_entry_number?: string
          has_injuries?: boolean | null
          id?: string
          injury_details?: string | null
          is_completed?: boolean | null
          pdf_url?: string | null
          updated_at?: string | null
          vehicle_registration?: string | null
          witness1_address?: string
          witness1_name?: string
          witness1_signature?: string | null
          witness2_address?: string
          witness2_name?: string
          witness2_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arrest_memos_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrest_memos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      bnss_checklists: {
        Row: {
          accused_id: string
          case_id: string
          created_at: string | null
          ground_a_prevent_offence: boolean | null
          ground_b_proper_investigation: boolean | null
          ground_c_evidence_protection: boolean | null
          ground_d_prevent_inducement: boolean | null
          ground_e_ensure_court_presence: boolean | null
          id: string
          is_completed: boolean | null
          officer_designation: string
          officer_id: string | null
          officer_name: string
          officer_signature: string | null
          pdf_url: string | null
          updated_at: string | null
        }
        Insert: {
          accused_id: string
          case_id: string
          created_at?: string | null
          ground_a_prevent_offence?: boolean | null
          ground_b_proper_investigation?: boolean | null
          ground_c_evidence_protection?: boolean | null
          ground_d_prevent_inducement?: boolean | null
          ground_e_ensure_court_presence?: boolean | null
          id?: string
          is_completed?: boolean | null
          officer_designation: string
          officer_id?: string | null
          officer_name: string
          officer_signature?: string | null
          pdf_url?: string | null
          updated_at?: string | null
        }
        Update: {
          accused_id?: string
          case_id?: string
          created_at?: string | null
          ground_a_prevent_offence?: boolean | null
          ground_b_proper_investigation?: boolean | null
          ground_c_evidence_protection?: boolean | null
          ground_d_prevent_inducement?: boolean | null
          ground_e_ensure_court_presence?: boolean | null
          id?: string
          is_completed?: boolean | null
          officer_designation?: string
          officer_id?: string | null
          officer_name?: string
          officer_signature?: string | null
          pdf_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bnss_checklists_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bnss_checklists_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_officers: {
        Row: {
          case_id: string
          created_at: string | null
          designation: string
          id: string
          officer_id: string | null
          officer_name: string
          role_in_case: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          designation: string
          id?: string
          officer_id?: string | null
          officer_name: string
          role_in_case: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          designation?: string
          id?: string
          officer_id?: string | null
          officer_name?: string
          role_in_case?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_officers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          approved_by: string | null
          case_date: string
          case_number: string
          coach_number: string | null
          court_name: string | null
          court_production_date: string | null
          court_production_time: string | null
          created_at: string | null
          created_by: string
          gd_entry_number: string | null
          id: string
          incident_location: string
          jurisdiction: string | null
          platform_number: string | null
          post_name: string
          raid_end_time: string | null
          raid_start_time: string | null
          railway_zone: string
          remarks: string | null
          section_of_law: string
          station_name: string
          status: Database["public"]["Enums"]["case_status"]
          train_name: string | null
          train_number: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          case_date?: string
          case_number: string
          coach_number?: string | null
          court_name?: string | null
          court_production_date?: string | null
          court_production_time?: string | null
          created_at?: string | null
          created_by: string
          gd_entry_number?: string | null
          id?: string
          incident_location: string
          jurisdiction?: string | null
          platform_number?: string | null
          post_name: string
          raid_end_time?: string | null
          raid_start_time?: string | null
          railway_zone: string
          remarks?: string | null
          section_of_law: string
          station_name: string
          status?: Database["public"]["Enums"]["case_status"]
          train_name?: string | null
          train_number?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          case_date?: string
          case_number?: string
          coach_number?: string | null
          court_name?: string | null
          court_production_date?: string | null
          court_production_time?: string | null
          created_at?: string | null
          created_by?: string
          gd_entry_number?: string | null
          id?: string
          incident_location?: string
          jurisdiction?: string | null
          platform_number?: string | null
          post_name?: string
          raid_end_time?: string | null
          raid_start_time?: string | null
          railway_zone?: string
          remarks?: string | null
          section_of_law?: string
          station_name?: string
          status?: Database["public"]["Enums"]["case_status"]
          train_name?: string | null
          train_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      challan_accused: {
        Row: {
          accused_id: string
          challan_id: string
          created_at: string | null
          id: string
          sl_number: number
        }
        Insert: {
          accused_id: string
          challan_id: string
          created_at?: string | null
          id?: string
          sl_number: number
        }
        Update: {
          accused_id?: string
          challan_id?: string
          created_at?: string | null
          id?: string
          sl_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "challan_accused_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challan_accused_challan_id_fkey"
            columns: ["challan_id"]
            isOneToOne: false
            referencedRelation: "accused_challans"
            referencedColumns: ["id"]
          },
        ]
      }
      court_forwardings: {
        Row: {
          accused_id: string
          bail_status: string
          bnss_references: string
          case_id: string
          complainant_designation: string
          complainant_name: string
          complainant_signature: string | null
          created_at: string | null
          detection_details: string
          forwarding_officer_designation: string | null
          forwarding_officer_name: string | null
          forwarding_officer_signature: string | null
          id: string
          is_completed: boolean | null
          offence_explanation: string
          pdf_url: string | null
          prayer_for_cognizance: string
          raid_description: string
          railway_name: string
          state_name: string
          ticket_authority_logic: string | null
          updated_at: string | null
        }
        Insert: {
          accused_id: string
          bail_status: string
          bnss_references: string
          case_id: string
          complainant_designation: string
          complainant_name: string
          complainant_signature?: string | null
          created_at?: string | null
          detection_details: string
          forwarding_officer_designation?: string | null
          forwarding_officer_name?: string | null
          forwarding_officer_signature?: string | null
          id?: string
          is_completed?: boolean | null
          offence_explanation: string
          pdf_url?: string | null
          prayer_for_cognizance: string
          raid_description: string
          railway_name: string
          state_name: string
          ticket_authority_logic?: string | null
          updated_at?: string | null
        }
        Update: {
          accused_id?: string
          bail_status?: string
          bnss_references?: string
          case_id?: string
          complainant_designation?: string
          complainant_name?: string
          complainant_signature?: string | null
          created_at?: string | null
          detection_details?: string
          forwarding_officer_designation?: string | null
          forwarding_officer_name?: string | null
          forwarding_officer_signature?: string | null
          id?: string
          is_completed?: boolean | null
          offence_explanation?: string
          pdf_url?: string | null
          prayer_for_cognizance?: string
          raid_description?: string
          railway_name?: string
          state_name?: string
          ticket_authority_logic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "court_forwardings_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_forwardings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      law_sections: {
        Row: {
          act_name: string
          created_at: string | null
          description: string | null
          id: string
          is_bailable: boolean | null
          max_punishment: string | null
          section_code: string
        }
        Insert: {
          act_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_bailable?: boolean | null
          max_punishment?: string | null
          section_code: string
        }
        Update: {
          act_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_bailable?: boolean | null
          max_punishment?: string | null
          section_code?: string
        }
        Relationships: []
      }
      medical_memos: {
        Row: {
          accused_id: string
          case_id: string
          created_at: string | null
          doctor_signature: string | null
          examination_date: string
          examination_time: string
          fitness_status: string
          has_injuries: boolean | null
          hospital_name: string
          id: string
          injury_description: string | null
          is_completed: boolean | null
          medical_certificate_url: string | null
          medical_officer_name: string
          pdf_url: string | null
          remarks: string | null
          updated_at: string | null
        }
        Insert: {
          accused_id: string
          case_id: string
          created_at?: string | null
          doctor_signature?: string | null
          examination_date: string
          examination_time: string
          fitness_status: string
          has_injuries?: boolean | null
          hospital_name: string
          id?: string
          injury_description?: string | null
          is_completed?: boolean | null
          medical_certificate_url?: string | null
          medical_officer_name: string
          pdf_url?: string | null
          remarks?: string | null
          updated_at?: string | null
        }
        Update: {
          accused_id?: string
          case_id?: string
          created_at?: string | null
          doctor_signature?: string | null
          examination_date?: string
          examination_time?: string
          fitness_status?: string
          has_injuries?: boolean | null
          hospital_name?: string
          id?: string
          injury_description?: string | null
          is_completed?: boolean | null
          medical_certificate_url?: string | null
          medical_officer_name?: string
          pdf_url?: string | null
          remarks?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_memos_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_memos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_search_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          item_name: string
          quantity: number
          remarks: string | null
          search_memo_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name: string
          quantity?: number
          remarks?: string | null
          search_memo_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string
          quantity?: number
          remarks?: string | null
          search_memo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_search_items_search_memo_id_fkey"
            columns: ["search_memo_id"]
            isOneToOne: false
            referencedRelation: "personal_search_memos"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_search_memos: {
        Row: {
          accused_id: string
          accused_signature: string | null
          articles_found: string | null
          case_id: string
          cash_found: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          is_nil_search: boolean | null
          pdf_url: string | null
          search_date: string
          search_place: string
          search_time: string
          searching_officer_designation: string
          searching_officer_id: string | null
          searching_officer_name: string
          searching_officer_signature: string | null
          updated_at: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature: string | null
        }
        Insert: {
          accused_id: string
          accused_signature?: string | null
          articles_found?: string | null
          case_id: string
          cash_found?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_nil_search?: boolean | null
          pdf_url?: string | null
          search_date: string
          search_place: string
          search_time: string
          searching_officer_designation: string
          searching_officer_id?: string | null
          searching_officer_name: string
          searching_officer_signature?: string | null
          updated_at?: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature?: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature?: string | null
        }
        Update: {
          accused_id?: string
          accused_signature?: string | null
          articles_found?: string | null
          case_id?: string
          cash_found?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_nil_search?: boolean | null
          pdf_url?: string | null
          search_date?: string
          search_place?: string
          search_time?: string
          searching_officer_designation?: string
          searching_officer_id?: string | null
          searching_officer_name?: string
          searching_officer_signature?: string | null
          updated_at?: string | null
          witness1_address?: string
          witness1_name?: string
          witness1_signature?: string | null
          witness2_address?: string
          witness2_name?: string
          witness2_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_search_memos_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_search_memos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          belt_number: string | null
          created_at: string | null
          designation: string
          full_name: string
          id: string
          phone: string | null
          post_name: string
          railway_zone: string
          updated_at: string | null
        }
        Insert: {
          belt_number?: string | null
          created_at?: string | null
          designation: string
          full_name: string
          id: string
          phone?: string | null
          post_name: string
          railway_zone: string
          updated_at?: string | null
        }
        Update: {
          belt_number?: string | null
          created_at?: string | null
          designation?: string
          full_name?: string
          id?: string
          phone?: string | null
          post_name?: string
          railway_zone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      railway_posts: {
        Row: {
          court_jurisdiction: string | null
          court_name: string | null
          created_at: string | null
          division: string
          id: string
          post_name: string
          zone_name: string
        }
        Insert: {
          court_jurisdiction?: string | null
          court_name?: string | null
          created_at?: string | null
          division: string
          id?: string
          post_name: string
          zone_name: string
        }
        Update: {
          court_jurisdiction?: string | null
          court_name?: string | null
          created_at?: string | null
          division?: string
          id?: string
          post_name?: string
          zone_name?: string
        }
        Relationships: []
      }
      seized_items: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          item_name: string
          photo_url: string | null
          quantity: number
          remarks: string | null
          seizure_memo_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          item_name: string
          photo_url?: string | null
          quantity?: number
          remarks?: string | null
          seizure_memo_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          item_name?: string
          photo_url?: string | null
          quantity?: number
          remarks?: string | null
          seizure_memo_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seized_items_seizure_memo_id_fkey"
            columns: ["seizure_memo_id"]
            isOneToOne: false
            referencedRelation: "seizure_memos"
            referencedColumns: ["id"]
          },
        ]
      }
      seizure_memos: {
        Row: {
          accused_id: string
          case_id: string
          created_at: string | null
          id: string
          is_completed: boolean | null
          pdf_url: string | null
          seizing_officer_designation: string
          seizing_officer_id: string | null
          seizing_officer_name: string
          seizing_officer_signature: string | null
          seizure_date: string
          seizure_place: string
          seizure_time: string
          updated_at: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature: string | null
        }
        Insert: {
          accused_id: string
          case_id: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          pdf_url?: string | null
          seizing_officer_designation: string
          seizing_officer_id?: string | null
          seizing_officer_name: string
          seizing_officer_signature?: string | null
          seizure_date: string
          seizure_place: string
          seizure_time: string
          updated_at?: string | null
          witness1_address: string
          witness1_name: string
          witness1_signature?: string | null
          witness2_address: string
          witness2_name: string
          witness2_signature?: string | null
        }
        Update: {
          accused_id?: string
          case_id?: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          pdf_url?: string | null
          seizing_officer_designation?: string
          seizing_officer_id?: string | null
          seizing_officer_name?: string
          seizing_officer_signature?: string | null
          seizure_date?: string
          seizure_place?: string
          seizure_time?: string
          updated_at?: string | null
          witness1_address?: string
          witness1_name?: string
          witness1_signature?: string | null
          witness2_address?: string
          witness2_name?: string
          witness2_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seizure_memos_accused_id_fkey"
            columns: ["accused_id"]
            isOneToOne: false
            referencedRelation: "accused"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seizure_memos_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "field_officer" | "court_admin"
      case_status:
        | "draft"
        | "in_progress"
        | "pending_approval"
        | "approved"
        | "forwarded_to_court"
        | "closed"
      gender_type: "male" | "female" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "supervisor", "field_officer", "court_admin"],
      case_status: [
        "draft",
        "in_progress",
        "pending_approval",
        "approved",
        "forwarded_to_court",
        "closed",
      ],
      gender_type: ["male", "female", "other"],
    },
  },
} as const
