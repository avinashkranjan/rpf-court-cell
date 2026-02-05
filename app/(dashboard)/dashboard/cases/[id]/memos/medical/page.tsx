"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FileDown, Upload } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { MedicalInspectionMemo } from "@/lib/types/case";

export default function MedicalInspectionMemoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const { addMedicalInspectionMemo, getArrestMemosByCaseId } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);
  const arrestMemos = getArrestMemosByCaseId(params.id);

  const [formData, setFormData] = useState({
    accusedId: "",
    arrestReference: "",
    injuryDetails: "",
    doctorName: "",
    medicalInstitution: "",
    examinationDate: new Date().toISOString().split("T")[0],
    examinationTime: new Date().toTimeString().slice(0, 5),
    medicalCertificate: "",
    doctorSignature: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAccusedChange = (accusedId: string) => {
    setFormData({ ...formData, accusedId });
    
    // Auto-populate arrest reference if available
    const arrestMemo = arrestMemos.find((m) => m.accusedId === accusedId);
    if (arrestMemo) {
      setFormData((prev) => ({
        ...prev,
        accusedId,
        arrestReference: `Arrest Memo dated ${new Date(arrestMemo.arrestDate).toLocaleDateString()} at ${arrestMemo.arrestTime}`,
        injuryDetails: arrestMemo.injuryDetails || "",
      }));
    }
  };

  const handleCertificateUpload = () => {
    alert("Medical certificate upload - would open file picker for PDF/image upload");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accusedId) newErrors.accusedId = "Please select an accused";
    if (!formData.arrestReference) newErrors.arrestReference = "Arrest reference is required";
    if (!formData.injuryDetails) newErrors.injuryDetails = "Injury details are required";
    if (!formData.doctorName) newErrors.doctorName = "Doctor name is required";
    if (!formData.medicalInstitution) newErrors.medicalInstitution = "Medical institution is required";
    if (!formData.examinationDate) newErrors.examinationDate = "Examination date is required";
    if (!formData.examinationTime) newErrors.examinationTime = "Examination time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();

    const newMedicalMemo: MedicalInspectionMemo = {
      id: `medical_memo_${Date.now()}`,
      caseId: params.id,
      accusedId: formData.accusedId,
      arrestReference: formData.arrestReference,
      injuryDetails: formData.injuryDetails,
      doctorName: formData.doctorName,
      medicalInstitution: formData.medicalInstitution,
      examinationDate: formData.examinationDate,
      examinationTime: formData.examinationTime,
      medicalCertificate: formData.medicalCertificate || undefined,
      doctorSignature: formData.doctorSignature || undefined,
      createdAt: now,
      updatedAt: now,
    };

    addMedicalInspectionMemo(newMedicalMemo);
    alert("Medical Inspection Memo saved successfully!");
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
            <p className="mb-4">Please add accused profiles before creating medical inspection memo.</p>
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
            <h1 className="text-xl font-bold text-gray-800">Medical Inspection Memo</h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Accused Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Accused Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Select Accused */}
                  <div>
                    <Label htmlFor="accusedId">Select Accused *</Label>
                    <Select
                      id="accusedId"
                      value={formData.accusedId}
                      onChange={(e) => handleAccusedChange(e.target.value)}
                    >
                      <option value="">Select Accused</option>
                      {accusedList.map((accused) => (
                        <option key={accused.id} value={accused.id}>
                          {accused.name} (Age: {accused.age}, {accused.district})
                        </option>
                      ))}
                    </Select>
                    {errors.accusedId && (
                      <p className="text-sm text-red-600 mt-1">{errors.accusedId}</p>
                    )}
                  </div>

                  {selectedAccused && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-semibold mb-2">Selected Accused Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
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
                          <span className="text-gray-600">Gender:</span> {selectedAccused.gender}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Arrest Reference */}
                  <div>
                    <Label htmlFor="arrestReference">Arrest Reference *</Label>
                    <Textarea
                      id="arrestReference"
                      value={formData.arrestReference}
                      onChange={(e) =>
                        setFormData({ ...formData, arrestReference: e.target.value })
                      }
                      placeholder="Enter arrest memo reference or details"
                      rows={2}
                    />
                    {errors.arrestReference && (
                      <p className="text-sm text-red-600 mt-1">{errors.arrestReference}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-populated from arrest memo if available
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Examination Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Examination Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Injury Details */}
                  <div>
                    <Label htmlFor="injuryDetails">Injury Details *</Label>
                    <Textarea
                      id="injuryDetails"
                      value={formData.injuryDetails}
                      onChange={(e) =>
                        setFormData({ ...formData, injuryDetails: e.target.value })
                      }
                      placeholder="Describe any injuries, marks of violence, or medical conditions observed"
                      rows={4}
                    />
                    {errors.injuryDetails && (
                      <p className="text-sm text-red-600 mt-1">{errors.injuryDetails}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examinationDate">Examination Date *</Label>
                      <Input
                        id="examinationDate"
                        type="date"
                        value={formData.examinationDate}
                        onChange={(e) =>
                          setFormData({ ...formData, examinationDate: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.examinationDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.examinationDate}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="examinationTime">Examination Time *</Label>
                      <Input
                        id="examinationTime"
                        type="time"
                        value={formData.examinationTime}
                        onChange={(e) =>
                          setFormData({ ...formData, examinationTime: e.target.value })
                        }
                      />
                      {errors.examinationTime && (
                        <p className="text-sm text-red-600 mt-1">{errors.examinationTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Name */}
                  <div>
                    <Label htmlFor="doctorName">Doctor Name *</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorName: e.target.value })
                      }
                      placeholder="Enter doctor's name and qualification"
                    />
                    {errors.doctorName && (
                      <p className="text-sm text-red-600 mt-1">{errors.doctorName}</p>
                    )}
                  </div>

                  {/* Medical Institution */}
                  <div>
                    <Label htmlFor="medicalInstitution">Medical Institution *</Label>
                    <Input
                      id="medicalInstitution"
                      value={formData.medicalInstitution}
                      onChange={(e) =>
                        setFormData({ ...formData, medicalInstitution: e.target.value })
                      }
                      placeholder="Enter hospital/clinic name and location"
                    />
                    {errors.medicalInstitution && (
                      <p className="text-sm text-red-600 mt-1">{errors.medicalInstitution}</p>
                    )}
                  </div>

                  {/* Medical Certificate Upload */}
                  <div>
                    <Label>Medical Certificate</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCertificateUpload}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Medical Certificate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload PDF or image of medical certificate issued by doctor
                    </p>
                  </div>

                  {/* Doctor Signature Section */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-semibold mb-2">Doctor&apos;s Signature</p>
                    <p className="text-xs text-gray-600">
                      After saving, this memo will be available for doctor&apos;s digital signature.
                      The system will generate a PDF with the doctor&apos;s attestation.
                    </p>
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
                        alert("PDF Preview - Would show formatted medical inspection memo")
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Medical Memo
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