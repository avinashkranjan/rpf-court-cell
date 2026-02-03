"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, User, Lock } from "lucide-react";

export default function DscLoginPage() {
  const router = useRouter();
  const generateCaptcha = () =>
    // eslint-disable-next-line react-hooks/purity
    Math.random().toString(36).substring(2, 7).toUpperCase();

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const handleDemoLogin = () => {
    router.push("/dashboard");
  };

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
        <Card className="w-[380px] border-yellow-400">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <Image src="/rpf-logo.png" alt="RPF" width={70} height={70} />
              <h2 className="text-red-600 font-semibold text-lg">
                Sr.DSC/DSC Login
              </h2>
            </div>

            <div className="relative mb-4">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="DSC User ID" />
            </div>

            <div className="relative mb-4">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="password" className="pl-9" placeholder="Password" />
            </div>

            {/* Captcha */}
            <div className="flex gap-2 mb-5">
              {/* Captcha Display */}
              <div className="flex items-center justify-center w-48 border rounded-md bg-gray-100 font-mono tracking-widest line-through select-none">
                {captcha}
              </div>

              {/* Captcha Input */}
              <Input
                placeholder="Enter Captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />

              {/* Refresh */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCaptcha(generateCaptcha());
                  setCaptchaInput("");
                }}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleDemoLogin}
            >
              Demo Login
            </Button>

            <p className="text-center text-sm mt-4">
              <Button
                variant="ghost"
                className="text-blue-600 cursor-pointer px-1"
                onClick={() => router.push("/login")}
              >
                Back to RPF Court Cell Login
              </Button>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="h-10 bg-blue-900 text-white flex items-center justify-center text-xs">
        Designed & Developed by Eastern Railway
      </footer>
    </div>
  );
}
