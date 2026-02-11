"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/**
 * Hook to require authentication on a page
 * Redirects to /login if user is not authenticated
 * 
 * @returns Object containing user, session, profile, and loading state
 * 
 * @example
 * function MyProtectedPage() {
 *   const { user, profile, loading } = useRequireAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   return <div>Hello {profile?.full_name}</div>;
 * }
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/login");
    }
  }, [auth.user, auth.loading, router]);

  return auth;
}
