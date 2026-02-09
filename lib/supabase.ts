import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Helper function to check if user has a specific role
export const hasRole = async (
  userId: string,
  role: "admin" | "court_admin" | "field_officer" | "supervisor",
) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .single();

  return !error && !!data;
};
