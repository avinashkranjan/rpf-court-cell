import { supabase } from "@/integrations/supabase/client";

export type ActivityAction =
  | "login"
  | "logout"
  | "case_created"
  | "case_updated"
  | "accused_added"
  | "seizure_memo_completed"
  | "arrest_memo_completed"
  | "personal_search_completed"
  | "medical_memo_completed"
  | "bnss_checklist_completed"
  | "court_forwarding_completed"
  | "challan_generated"
  | "profile_updated"
  | "officer_updated"
  | "pdf_downloaded";

export type EntityType =
  | "case"
  | "accused"
  | "seizure_memo"
  | "arrest_memo"
  | "personal_search"
  | "medical_memo"
  | "bnss_checklist"
  | "court_forwarding"
  | "challan"
  | "profile"
  | "officer"
  | "session";

export const logActivity = async (
  action: ActivityAction,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, any>,
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    login: "Logged in",
    logout: "Logged out",
    case_created: "Created case",
    case_updated: "Updated case",
    accused_added: "Added accused",
    seizure_memo_completed: "Completed seizure memo",
    arrest_memo_completed: "Completed arrest memo",
    personal_search_completed: "Completed personal search",
    medical_memo_completed: "Completed medical memo",
    bnss_checklist_completed: "Completed BNSS checklist",
    court_forwarding_completed: "Completed court forwarding",
    challan_generated: "Generated challan",
    profile_updated: "Updated profile",
    officer_updated: "Updated officer details",
    pdf_downloaded: "Downloaded PDF",
  };
  return labels[action] || action;
};

export const getEntityIcon = (entityType: string): string => {
  const icons: Record<string, string> = {
    case: "📁",
    accused: "👤",
    seizure_memo: "📋",
    arrest_memo: "⚖️",
    personal_search: "🔍",
    medical_memo: "🏥",
    bnss_checklist: "✅",
    court_forwarding: "🏛️",
    challan: "📄",
    profile: "👤",
    officer: "👮",
    session: "🔐",
  };
  return icons[entityType] || "📝";
};
