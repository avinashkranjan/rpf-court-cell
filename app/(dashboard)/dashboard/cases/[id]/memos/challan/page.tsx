"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, FileDown, QrCode } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { AccusedChallan } from "@/lib/types/case";

export default function ChallanGeneratorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const {
    getArrestMemosByCaseId,
    getSeizureMemosByCaseId,
    getPersonalSearchMemosByCaseId,
    getMedicalInspectionMemosByCaseId,
    getBNSSChecklistsByCaseId,
    addAccusedChallan,
  } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);
  const arrestMemos = getArrestMemosByCaseId(params.id);
  const seizureMemos = getSeizureMemosByCaseId(params.id);
  const searchMemos = getPersonalSearchMemosByCaseId(params.id);
  const medicalMemos = getMedicalInspectionMemosByCaseId(params.id);
  const bnssChecklists = getBNSSChecklistsByCaseId(params.id);

  const [formData, setFormData] = useState({
    selectedAccused: accusedList.map((a) => a.id),
    escortOfficers: "",
    challanDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAccusedToggle = (accusedId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAccused: prev.selectedAccused.includes(accusedId)
        ? prev.selectedAccused.filter((id) => id !== accusedId)
        : [...prev.selectedAccused, accusedId],
    }));
  };

  const generateQRCode = () => {
    if (!caseData) return "";
    // Generate QR code data string (in real implementation, this would be encoded)
    return `RPF-CHALLAN:${caseData.caseNumber}:${new Date().getTime()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.selectedAccused.length === 0) {
      newErrors.selectedAccused = "At least one accused must be selected";
    }

    if (!formData.escortOfficers.trim()) {
      newErrors.escortOfficers = "Escort officers are required";
    }

    if (!formData.challanDate) {
      newErrors.challanDate = "Challan date is required";
    }

    if (arrestMemos.length === 0) {
      newErrors.memos = "At least one arrest memo must be created before generating challan";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const qrCode = generateQRCode();
    
    // Generate challan number
    const challanNumber = `CHALLAN/${caseData?.caseNumber}/${new Date().getTime()}`;

    // Compile all enclosures
    const enclosures = [
      ...arrestMemos.map((m) => `Arrest Memo - ${new Date(m.arrestDate).toLocaleDateString()}`),
      ...seizureMemos.map((m) => `Seizure Memo - ${new Date(m.seizureDate).toLocaleDateString()}`),
      ...searchMemos.map((m) => `Personal Search Memo - ${new Date(m.searchDate).toLocaleDateString()}`),
      ...medicalMemos.map((m) => `Medical Inspection Memo - ${new Date(m.examinationDate).toLocaleDateString()}`),
      ...bnssChecklists.map(() => `BNSS Arrest Checklist`),
    ];

    const newChallan: AccusedChallan = {
      id: `challan_${Date.now()}`,
      caseId: params.id,
      accusedIds: formData.selectedAccused,
      sections: caseData?.sectionsOfLaw || [],
      enclosures,
      escortOfficers: formData.escortOfficers.split(",").map((o) => o.trim()).filter(Boolean),
      qrCode,
      challanNumber,
      challanDate: formData.challanDate,
      createdAt: now,
      updatedAt: now,
    };

    addAccusedChallan(newChallan);
    alert("Accused Challan generated successfully!");
    router.push(`/dashboard/cases/${params.id}/memos`);
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
            <p className="mb-4">Please add accused profiles before generating challan.</p>
            <Button onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}>
              Add Accused Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalEnclosures = arrestMemos.length + seizureMemos.length + searchMemos.length + medicalMemos.length + bnssChecklists.length;

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
            <h1 className="text-xl font-bold text-gray-800">Accused Challan Generator</h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Case Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Case Number</p>
                      <p className="font-semibold">{caseData.caseNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Registration Date</p>
                      <p className="font-semibold">
                        {new Date(caseData.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Railway Zone</p>
                      <p className="font-semibold">{caseData.railwayZone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Incident Location</p>
                      <p className="font-semibold">{caseData.incidentLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Select Accused */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Accused for Challan</CardTitle>
                  <p className="text-sm text-gray-600">
                    Select the accused to be included in this challan
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {accusedList.map((accused) => (
                      <div key={accused.id} className="p-4 border rounded">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <Checkbox
                            checked={formData.selectedAccused.includes(accused.id)}
                            onChange={() => handleAccusedToggle(accused.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{accused.name}</p>
                            <p className="text-sm text-gray-600">
                              S/o {accused.fatherName}, Age: {accused.age}, {accused.district}, {accused.state}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {accused.phone}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.selectedAccused && (
                    <p className="text-sm text-red-600 mt-2">{errors.selectedAccused}</p>
                  )}
                </CardContent>
              </Card>

              {/* Sections of Law */}
              <Card>
                <CardHeader>
                  <CardTitle>Applicable Sections of Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caseData.sectionsOfLaw.map((section, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enclosures */}
              <Card>
                <CardHeader>
                  <CardTitle>Enclosures ({totalEnclosures} documents)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {arrestMemos.map((memo, index) => (
                      <div key={memo.id} className="p-2 border-l-4 border-blue-500 bg-blue-50">
                        <p className="text-sm font-semibold">
                          Enclosure {index + 1}: Arrest Memo (Annexure-A)
                        </p>
                        <p className="text-xs text-gray-600">
                          Date: {new Date(memo.arrestDate).toLocaleDateString()} at {memo.arrestTime}
                        </p>
                      </div>
                    ))}
                    {seizureMemos.map((memo, index) => (
                      <div key={memo.id} className="p-2 border-l-4 border-purple-500 bg-purple-50">
                        <p className="text-sm font-semibold">
                          Enclosure {arrestMemos.length + index + 1}: Seizure Memo
                        </p>
                        <p className="text-xs text-gray-600">
                          Date: {new Date(memo.seizureDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {searchMemos.map((memo, index) => (
                      <div key={memo.id} className="p-2 border-l-4 border-orange-500 bg-orange-50">
                        <p className="text-sm font-semibold">
                          Enclosure {arrestMemos.length + seizureMemos.length + index + 1}: Personal Search Memo
                        </p>
                        <p className="text-xs text-gray-600">
                          Date: {new Date(memo.searchDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {medicalMemos.map((memo, index) => (
                      <div key={memo.id} className="p-2 border-l-4 border-green-500 bg-green-50">
                        <p className="text-sm font-semibold">
                          Enclosure {arrestMemos.length + seizureMemos.length + searchMemos.length + index + 1}: Medical Inspection Memo
                        </p>
                        <p className="text-xs text-gray-600">
                          Date: {new Date(memo.examinationDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {bnssChecklists.map((checklist, index) => (
                      <div key={checklist.id} className="p-2 border-l-4 border-red-500 bg-red-50">
                        <p className="text-sm font-semibold">
                          Enclosure {arrestMemos.length + seizureMemos.length + searchMemos.length + medicalMemos.length + index + 1}: BNSS Arrest Checklist
                        </p>
                        <p className="text-xs text-gray-600">
                          Date: {new Date(checklist.attestationDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {totalEnclosures === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No documents available. Please create required memos first.
                      </p>
                    )}
                  </div>
                  {errors.memos && (
                    <p className="text-sm text-red-600 mt-2">{errors.memos}</p>
                  )}
                </CardContent>
              </Card>

              {/* Escort Officers */}
              <Card>
                <CardHeader>
                  <CardTitle>Escort Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="escortOfficers">Escort Officers *</Label>
                    <Textarea
                      id="escortOfficers"
                      value={formData.escortOfficers}
                      onChange={(e) =>
                        setFormData({ ...formData, escortOfficers: e.target.value })
                      }
                      placeholder="Enter escort officer names separated by commas"
                      rows={2}
                    />
                    {errors.escortOfficers && (
                      <p className="text-sm text-red-600 mt-1">{errors.escortOfficers}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter names of officers who will escort the accused to court
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="challanDate">Challan Date *</Label>
                    <Input
                      id="challanDate"
                      type="date"
                      value={formData.challanDate}
                      onChange={(e) =>
                        setFormData({ ...formData, challanDate: e.target.value })
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.challanDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.challanDate}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Section */}
              <Card className="border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <QrCode className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold mb-1">QR Code Verification</p>
                      <p className="text-xs text-gray-700">
                        A unique QR code will be generated for this challan, enabling court officials
                        to verify authenticity and access digital records. The QR code will be
                        embedded in the PDF challan document.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-end gap-2">
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
                      onClick={() =>
                        alert("PDF Preview - Would show complete challan with all accused details, sections, enclosures, and QR code")
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Preview Challan PDF
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Generate Challan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}