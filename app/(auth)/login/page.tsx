"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, User, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const generateCaptcha = () =>
    Math.random().toString(36).substring(2, 7).toUpperCase();

  const { signIn } = useAuth();
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    userId?: string;
    password?: string;
    captcha?: string;
    loginError?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const nextErrors: typeof errors = {};
    setErrors({});

    if (!userId.trim()) {
      nextErrors.userId = "User ID is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    if (!captchaInput.trim()) {
      nextErrors.captcha = "Captcha is required";
    } else if (captchaInput.trim().toUpperCase() !== captcha) {
      nextErrors.captcha = "Captcha does not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);

      const { error } = await signIn(userId.trim(), password);

      if (error) {
        toast.error("Login Failed", {
          description: error.message ?? "Invalid credentials",
        });
        setErrors({ loginError: error.message ?? "Invalid credentials" });
        return;
      }

      toast.success("Login Successful", {
        description: "Welcome back!",
      });

      router.push("/dashboard");
    } catch (err) {
      setErrors({
        loginError:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
      toast.error("Unexpected Error", {
        description:
          err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      setLoading(false);
    }
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
          Railway Protection Act
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <Card className="w-96 border-yellow-400">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <Image src="/rpf-logo.png" alt="RPF" width={70} height={70} />
              <h2 className="text-red-600 font-semibold text-lg">
                RPF Court Cell Login
              </h2>
            </div>

            <div className="relative mb-4">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              {errors.userId && (
                <p className="text-xs text-red-600 mt-1">{errors.userId}</p>
              )}
            </div>

            <div className="relative mb-4">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                className="pl-9"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Captcha */}
            <div className="flex gap-2 mb-2">
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
            {errors.captcha && (
              <p className="text-xs text-red-600 mb-3">{errors.captcha}</p>
            )}

            {errors.loginError && (
              <p className="text-xs text-red-600 mb-3">{errors.loginError}</p>
            )}

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm mt-4">
              Login as
              <Button
                variant="ghost"
                className="ml-1 text-blue-600 cursor-pointer px-1"
                onClick={() => router.push("/dsc-login")}
              >
                Sr.DSC/DSC Login
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
