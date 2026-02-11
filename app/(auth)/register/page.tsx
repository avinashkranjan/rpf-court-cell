"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

const designations = [
  "Constable",
  "Head Constable",
  "ASI",
  "SI",
  "Inspector",
  "SIP",
  "SIPF",
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    designation: "",
    belt_number: "",
    post_name: "",
    railway_zone: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        designation: formData.designation,
        belt_number: formData.belt_number || null,
        post_name: formData.post_name,
        railway_zone: formData.railway_zone,
        phone: formData.phone || null,
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account",
        });
        router.push("/login");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          "An unexpected error occurred. Please try again." +
          (err instanceof Error ? err.message : ""),
        variant: "destructive",
      });
    } finally {
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
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-yellow-400">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <Image src="/rpf-logo.png" alt="RPF" width={70} height={70} />
              <h2 className="text-red-600 font-semibold text-lg">
                Officer Registration
              </h2>
              <p className="text-sm text-gray-600">
                Create your RPF FIR/Case Registration Portal account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="designation">Designation *</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, designation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="belt_number">Belt Number</Label>
                  <Input
                    id="belt_number"
                    placeholder="e.g., RPF-12345"
                    value={formData.belt_number}
                    onChange={(e) =>
                      setFormData({ ...formData, belt_number: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="post_name">Post Name *</Label>
                  <Input
                    id="post_name"
                    placeholder="e.g., RPF Post Howrah"
                    value={formData.post_name}
                    onChange={(e) =>
                      setFormData({ ...formData, post_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="railway_zone">Railway Zone *</Label>
                  <Input
                    id="railway_zone"
                    placeholder="e.g., Eastern Railway"
                    value={formData.railway_zone}
                    onChange={(e) =>
                      setFormData({ ...formData, railway_zone: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="officer.name@rpf.gov.in"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>

              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Button
                  variant="ghost"
                  className="text-blue-600 cursor-pointer px-1"
                  onClick={() => router.push("/login")}
                  type="button"
                >
                  Login here
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="h-10 bg-blue-900 text-white flex items-center justify-center text-xs">
        Designed & Developed by Eastern Railway
      </footer>
    </div>
  );
}
