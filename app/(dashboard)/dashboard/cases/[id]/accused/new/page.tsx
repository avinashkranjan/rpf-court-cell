"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Camera, AlertCircle } from "lucide-react";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useCaseStore } from "@/lib/store/case-store";
import { AccusedProfile } from "@/lib/types/case";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Puducherry", "Jammu and Kashmir", "Ladakh",
];

export default function AddAccusedPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addAccused, checkDuplicate } = useAccusedStore();
  const { getCaseById } = useCaseStore();
  
  const caseData = getCaseById(params.id);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
    phone: "",
    address: "",
    state: "",
    district: "",
    photo: "",
    proofDocument: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string>("");

  const handleDOBChange = (dob: string) => {
    setFormData({ ...formData, dateOfBirth: dob });
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age: age.toString() }));
    }
  };

  const handlePhoneBlur = () => {
    if (formData.name && formData.phone) {
      const duplicate = checkDuplicate(formData.name, formData.phone);
      if (duplicate) {
        setDuplicateWarning(
          `Warning: Similar accused profile found (Case ID: ${duplicate.caseId})`
        );
      } else {
        setDuplicateWarning("");
      }
    }
  };

  const handlePhotoCapture = () => {
    // In a real implementation, this would open camera or file picker
    alert("Camera feature will be implemented with proper permissions");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.age || parseInt(formData.age) <= 0) newErrors.age = "Valid age is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (formData.phone.length !== 10) newErrors.phone = "Phone must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.district.trim()) newErrors.district = "District is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const newAccused: AccusedProfile = {
      id: `accused_${Date.now()}`,
      caseId: params.id,
      name: formData.name,
      fatherName: formData.fatherName,
      age: parseInt(formData.age),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth || undefined,
      phone: formData.phone,
      address: formData.address,
      state: formData.state,
      district: formData.district,
      photo: formData.photo || undefined,
      proofDocument: formData.proofDocument || undefined,
      createdAt: now,
      updatedAt: now,
    };

    addAccused(newAccused);
    router.push(`/dashboard/cases/${params.id}/accused`);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Case not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/cases/${params.id}/accused`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Add Accused Profile</h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {duplicateWarning && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">{duplicateWarning}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Accused Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fatherName">Father&apos;s Name *</Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Enter father's name"
                    />
                    {errors.fatherName && (
                      <p className="text-sm text-red-600 mt-1">{errors.fatherName}</p>
                    )}
                  </div>
                </div>

                {/* Age and DOB */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleDOBChange(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age"
                      min="1"
                      max="120"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600 mt-1">{errors.age}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value as typeof formData.gender })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={handlePhoneBlur}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* State and District */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Enter district"
                    />
                    {errors.district && (
                      <p className="text-sm text-red-600 mt-1">{errors.district}</p>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Photo</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePhotoCapture}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Photo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Capture or upload accused photo
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/cases/${params.id}/accused`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Accused Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}