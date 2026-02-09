"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, FileDown } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { ArrestMemo } from "@/lib/types/case";

export default function ArrestMemoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const { addArrestMemo } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);

  const [formData, setFormData] = useState({
    accusedId: "",
    arrestDate: new Date().toISOString().split("T")[0],
    arrestTime: new Date().toTimeString().slice(0, 5),
    arrestLocation: caseData?.incidentLocation || "",
    gdNumber: "",
    policeStation: "",
    arrestingOfficer: caseData?.officersInvolved[0] || "",
    vehicleDetails: "",
    courtDetails: "",
    witnesses: "",
    injuryDetails: "",
    bnssCompliant: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accusedId) newErrors.accusedId = "Please select an accused";
    if (!formData.arrestDate) newErrors.arrestDate = "Arrest date is required";
    if (!formData.arrestTime) newErrors.arrestTime = "Arrest time is required";
    if (!formData.arrestLocation) newErrors.arrestLocation = "Arrest location is required";
    if (!formData.gdNumber) newErrors.gdNumber = "GD number is required";
    if (!formData.policeStation) newErrors.policeStation = "Police station is required";
    if (!formData.arrestingOfficer) newErrors.arrestingOfficer = "Arresting officer is required";
    if (!formData.courtDetails) newErrors.courtDetails = "Court details are required";
    if (!formData.witnesses) newErrors.witnesses = "At least one witness is required";
    if (!formData.bnssCompliant) newErrors.bnssCompliant = "BNSS compliance must be confirmed";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const witnessArray = formData.witnesses.split(",").map((w) => w.trim()).filter(Boolean);

    const newArrestMemo: ArrestMemo = {
      id: `arrest_memo_${Date.now()}`,
      caseId: params.id,
      accusedId: formData.accusedId,
      arrestDate: formData.arrestDate,
      arrestTime: formData.arrestTime,
      arrestLocation: formData.arrestLocation,
      gdNumber: formData.gdNumber,
      policeStation: formData.policeStation,
      arrestingOfficer: formData.arrestingOfficer,
      vehicleDetails: formData.vehicleDetails || undefined,
      courtDetails: formData.courtDetails,
      witnesses: witnessArray,
      injuryDetails: formData.injuryDetails || undefined,
      bnssCompliant: formData.bnssCompliant,
      createdAt: now,
      updatedAt: now,
    };

    addArrestMemo(newArrestMemo);
    alert("Arrest Memo saved successfully!");
    router.push(`/dashboard/cases/${params.id}/memos`);
  };

  const handleGeneratePDF = () => {
    // PDF generation logic would go here
    alert("PDF Generation - This would generate a BNSS-compliant PDF with all details and signatures");
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Case not found</p>
      </div>
    );
  }

  if (accusedList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="mb-4">Please add accused profiles before creating arrest memo.</p>
            <Button onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}>
              Add Accused Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAccused = accusedList.find((a) => a.id === formData.accusedId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/cases/${params.id}/memos`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Arrest Memo (Annexure-A)
            </h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Arrest Details</CardTitle>
                <p className="text-sm text-gray-600">
                  Digital form for arrest documentation with BNSS compliance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Select Accused */}
                <div>
                  <Label htmlFor="accusedId">Select Accused *</Label>
                  <Select
                    value={formData.accusedId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, accusedId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Accused" />
                    </SelectTrigger>
                    <SelectContent>
                      {accusedList.map((accused) => (
                        <SelectItem key={accused.id} value={accused.id}>
                          {accused.name} (Age: {accused.age}, {accused.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.accusedId && (
                    <p className="text-sm text-red-600 mt-1">{errors.accusedId}</p>
                  )}
                </div>

                {/* Show Selected Accused Details */}
                {selectedAccused && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-semibold">Selected Accused Details:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span> {selectedAccused.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Father&apos;s Name:</span>{" "}
                        {selectedAccused.fatherName}
                      </div>
                      <div>
                        <span className="text-gray-600">Age:</span> {selectedAccused.age}
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span> {selectedAccused.phone}
                      </div>
                    </div>
                  </div>
                )}

                {/* Arrest Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrestDate">Arrest Date *</Label>
                    <Input
                      id="arrestDate"
                      type="date"
                      value={formData.arrestDate}
                      onChange={(e) =>
                        setFormData({ ...formData, arrestDate: e.target.value })
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.arrestDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.arrestDate}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="arrestTime">Arrest Time *</Label>
                    <Input
                      id="arrestTime"
                      type="time"
                      value={formData.arrestTime}
                      onChange={(e) =>
                        setFormData({ ...formData, arrestTime: e.target.value })
                      }
                    />
                    {errors.arrestTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.arrestTime}</p>
                    )}
                  </div>
                </div>

                {/* Arrest Location */}
                <div>
                  <Label htmlFor="arrestLocation">Arrest Location *</Label>
                  <Textarea
                    id="arrestLocation"
                    value={formData.arrestLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, arrestLocation: e.target.value })
                    }
                    placeholder="Enter detailed arrest location"
                    rows={2}
                  />
                  {errors.arrestLocation && (
                    <p className="text-sm text-red-600 mt-1">{errors.arrestLocation}</p>
                  )}
                </div>

                {/* GD Number and Police Station */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gdNumber">GD Number *</Label>
                    <Input
                      id="gdNumber"
                      value={formData.gdNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gdNumber: e.target.value })
                      }
                      placeholder="Enter GD number"
                    />
                    {errors.gdNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.gdNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="policeStation">Police Station *</Label>
                    <Input
                      id="policeStation"
                      value={formData.policeStation}
                      onChange={(e) =>
                        setFormData({ ...formData, policeStation: e.target.value })
                      }
                      placeholder="Enter police station"
                    />
                    {errors.policeStation && (
                      <p className="text-sm text-red-600 mt-1">{errors.policeStation}</p>
                    )}
                  </div>
                </div>

                {/* Arresting Officer */}
                <div>
                  <Label htmlFor="arrestingOfficer">Arresting Officer *</Label>
                  <Input
                    id="arrestingOfficer"
                    value={formData.arrestingOfficer}
                    onChange={(e) =>
                      setFormData({ ...formData, arrestingOfficer: e.target.value })
                    }
                    placeholder="Enter arresting officer name and designation"
                  />
                  {errors.arrestingOfficer && (
                    <p className="text-sm text-red-600 mt-1">{errors.arrestingOfficer}</p>
                  )}
                </div>

                {/* Vehicle Details (Optional) */}
                <div>
                  <Label htmlFor="vehicleDetails">Vehicle Details (Optional)</Label>
                  <Input
                    id="vehicleDetails"
                    value={formData.vehicleDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleDetails: e.target.value })
                    }
                    placeholder="Enter vehicle details if applicable"
                  />
                </div>

                {/* Court Details */}
                <div>
                  <Label htmlFor="courtDetails">Court Details *</Label>
                  <Textarea
                    id="courtDetails"
                    value={formData.courtDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, courtDetails: e.target.value })
                    }
                    placeholder="Enter court name and jurisdiction"
                    rows={2}
                  />
                  {errors.courtDetails && (
                    <p className="text-sm text-red-600 mt-1">{errors.courtDetails}</p>
                  )}
                </div>

                {/* Witnesses */}
                <div>
                  <Label htmlFor="witnesses">Witnesses *</Label>
                  <Textarea
                    id="witnesses"
                    value={formData.witnesses}
                    onChange={(e) =>
                      setFormData({ ...formData, witnesses: e.target.value })
                    }
                    placeholder="Enter witness names separated by commas"
                    rows={2}
                  />
                  {errors.witnesses && (
                    <p className="text-sm text-red-600 mt-1">{errors.witnesses}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter multiple witness names separated by commas
                  </p>
                </div>

                {/* Injury Details */}
                <div>
                  <Label htmlFor="injuryDetails">Injury Details (if any)</Label>
                  <Textarea
                    id="injuryDetails"
                    value={formData.injuryDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, injuryDetails: e.target.value })
                    }
                    placeholder="Enter any injury details or marks of violence"
                    rows={3}
                  />
                </div>

                {/* BNSS Compliance */}
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.bnssCompliant}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          bnssCompliant: checked === true,
                        })
                      }
                    />
                    <div>
                      <p className="font-semibold text-sm">BNSS Compliance Confirmation *</p>
                      <p className="text-xs text-gray-600 mt-1">
                        I confirm that all arrest procedures have been conducted as per
                        Bharatiya Nagarik Suraksha Sanhita (BNSS) requirements and
                        accused has been informed of their rights.
                      </p>
                    </div>
                  </label>
                  {errors.bnssCompliant && (
                    <p className="text-sm text-red-600 mt-2">{errors.bnssCompliant}</p>
                  )}
                </div>

                {/* Signature Section Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-semibold mb-2">Digital Signatures</p>
                  <p className="text-xs text-gray-600">
                    After saving, this memo will be available for digital signatures
                    from the officer, accused, and witnesses. The system will generate
                    a PDF with all signatures and BNSS compliance stamp.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/cases/${params.id}/memos`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePDF}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Preview PDF
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Arrest Memo
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