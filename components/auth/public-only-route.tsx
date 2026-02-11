"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "./loading-spinner";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
