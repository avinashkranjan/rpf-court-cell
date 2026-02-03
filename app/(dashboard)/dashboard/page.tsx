"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("rpf_auth");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          className="hover:text-red-500 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" />
          Logout
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Coming Soon</h1>
        </div>
      </main>
    </div>
  );
}
