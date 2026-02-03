"use client";

import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="h-14 border-b bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Image src="/rpf-logo.png" alt="RPF" width={36} height={36} />
          <span className="font-semibold text-sm">
            Railway Protection Force
          </span>
        </div>

        <span className="text-sm text-blue-600 cursor-pointer">
          General Diary
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Coming Soon</h1>
        </div>
      </main>

      <footer className="h-10 bg-blue-900 text-white flex items-center justify-center text-xs">
        Designed & Developed by Eastern Railway
      </footer>
    </div>
  );
}
