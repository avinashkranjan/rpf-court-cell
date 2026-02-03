"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/lib/store/authStore";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const { isAuthenticated, isLoading } = useAuthStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("rpf_auth");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(Boolean(storedAuth));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
