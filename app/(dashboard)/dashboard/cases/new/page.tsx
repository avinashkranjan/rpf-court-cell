"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { RAILWAY_ZONES, SECTIONS_OF_LAW, Case } from "@/lib/types/case";

export default function NewCasePage() {
  const router = useRouter();
  const { generateCaseNumber, addCase } = useCaseStore();

  const [formData, setFormData] = useState({
    railwayZone: "",
    railwayPost: "",
    jurisdiction: "",
    sectionsOfLaw: [] as string[],
    customSection: "",
    incidentLocation: "",
    raidStartTime: "",
    raidEndTime: "",
    officersInvolved: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.railwayZone) newErrors.railwayZone = "Railway Zone is required";
    if (!formData.railwayPost) newErrors.railwayPost = "Railway Post is required";
    if (!formData.jurisdiction) newErrors.jurisdiction = "Jurisdiction is required";
    if (formData.sectionsOfLaw.length === 0)
      newErrors.sectionsOfLaw = "At least one section is required";
    if (!formData.incidentLocation)
      newErrors.incidentLocation = "Incident location is required";
    if (!formData.raidStartTime) newErrors.raidStartTime = "Raid start time is required";
    if (!formData.officersInvolved)
      newErrors.officersInvolved = "Officers involved is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const caseNumber = generateCaseNumber();
    const now = new Date().toISOString();

    const newCase: Case = {
      id: `case_${Date.now()}`,
      caseNumber,
      registrationDate: now,
      railwayZone: formData.railwayZone,
      railwayPost: formData.railwayPost,
      jurisdiction: formData.jurisdiction,
      sectionsOfLaw: formData.sectionsOfLaw,
      incidentLocation: formData.incidentLocation,
      raidStartTime: formData.raidStartTime,
      raidEndTime: formData.raidEndTime || now,
      officersInvolved: formData.officersInvolved
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
      status: "draft",
      createdBy: "current_user",
      createdAt: now,
      updatedAt: now,
    };

    addCase(newCase);
    router.push(`/dashboard/cases/${newCase.id}`);
  };

  const handleSectionToggle = (section: string) => {
    setFormData((prev) => ({
      ...prev,
      sectionsOfLaw: prev.sectionsOfLaw.includes(section)
        ? prev.sectionsOfLaw.filter((s) => s !== section)
        : [...prev.sectionsOfLaw, section],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/cases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Register New Case</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Case Registration Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Railway Zone */}
                <div>
                  <Label htmlFor="railwayZone">Railway Zone *</Label>
                  <Select
                    id="railwayZone"
                    value={formData.railwayZone}
                    onChange={(e) =>
                      setFormData({ ...formData, railwayZone: e.target.value })
                    }
                  >
                    <option value="">Select Zone</option>
                    {RAILWAY_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </Select>
                  {errors.railwayZone && (
                    <p className="text-sm text-red-600 mt-1">{errors.railwayZone}</p>
                  )}
                </div>

                {/* Railway Post */}
                <div>
                  <Label htmlFor="railwayPost">Railway Post *</Label>
                  <Input
                    id="railwayPost"
                    value={formData.railwayPost}
                    onChange={(e) =>
                      setFormData({ ...formData, railwayPost: e.target.value })
                    }
                    placeholder="Enter railway post"
                  />
                  {errors.railwayPost && (
                    <p className="text-sm text-red-600 mt-1">{errors.railwayPost}</p>
                  )}
                </div>

                {/* Jurisdiction */}
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) =>
                      setFormData({ ...formData, jurisdiction: e.target.value })
                    }
                    placeholder="Enter jurisdiction"
                  />
                  {errors.jurisdiction && (
                    <p className="text-sm text-red-600 mt-1">{errors.jurisdiction}</p>
                  )}
                </div>

                {/* Sections of Law */}
                <div>
                  <Label>Sections of Law *</Label>
                  <div className="space-y-2 mt-2 border rounded p-3 max-h-48 overflow-y-auto">
                    {SECTIONS_OF_LAW.map((section) => (
                      <label
                        key={section}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.sectionsOfLaw.includes(section)}
                          onChange={() => handleSectionToggle(section)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{section}</span>
                      </label>
                    ))}
                  </div>
                  {formData.sectionsOfLaw.includes("Other - Specify") && (
                    <Input
                      className="mt-2"
                      value={formData.customSection}
                      onChange={(e) =>
                        setFormData({ ...formData, customSection: e.target.value })
                      }
                      placeholder="Specify other section"
                    />
                  )}
                  {errors.sectionsOfLaw && (
                    <p className="text-sm text-red-600 mt-1">{errors.sectionsOfLaw}</p>
                  )}
                </div>

                {/* Incident Location */}
                <div>
                  <Label htmlFor="incidentLocation">Incident Location *</Label>
                  <Textarea
                    id="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, incidentLocation: e.target.value })
                    }
                    placeholder="Enter detailed incident location"
                    rows={3}
                  />
                  {errors.incidentLocation && (
                    <p className="text-sm text-red-600 mt-1">{errors.incidentLocation}</p>
                  )}
                </div>

                {/* Raid Timings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="raidStartTime">Raid Start Time *</Label>
                    <Input
                      id="raidStartTime"
                      type="datetime-local"
                      value={formData.raidStartTime}
                      onChange={(e) =>
                        setFormData({ ...formData, raidStartTime: e.target.value })
                      }
                    />
                    {errors.raidStartTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.raidStartTime}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="raidEndTime">Raid End Time</Label>
                    <Input
                      id="raidEndTime"
                      type="datetime-local"
                      value={formData.raidEndTime}
                      onChange={(e) =>
                        setFormData({ ...formData, raidEndTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Officers Involved */}
                <div>
                  <Label htmlFor="officersInvolved">Officers Involved *</Label>
                  <Textarea
                    id="officersInvolved"
                    value={formData.officersInvolved}
                    onChange={(e) =>
                      setFormData({ ...formData, officersInvolved: e.target.value })
                    }
                    placeholder="Enter officer names separated by commas"
                    rows={2}
                  />
                  {errors.officersInvolved && (
                    <p className="text-sm text-red-600 mt-1">{errors.officersInvolved}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter officer names separated by commas
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/cases")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Register Case
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