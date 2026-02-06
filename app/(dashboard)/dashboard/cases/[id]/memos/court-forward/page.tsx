"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FileDown, RefreshCw } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { CourtForwardingReport } from "@/lib/types/case";

export default function CourtForwardingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const {
    getArrestMemosByCaseId,
    getSeizureMemosByCaseId,
    getPersonalSearchMemosByCaseId,
    getMedicalInspectionMemosByCaseId,
    getBNSSChecklistsByCaseId,
    addCourtForwardingReport,
  } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);
  const arrestMemos = getArrestMemosByCaseId(params.id);
  const seizureMemos = getSeizureMemosByCaseId(params.id);
  const searchMemos = getPersonalSearchMemosByCaseId(params.id);
  const medicalMemos = getMedicalInspectionMemosByCaseId(params.id);
  const bnssChecklists = getBNSSChecklistsByCaseId(params.id);

  const [formData, setFormData] = useState({
    narrative: "",
    prosecutionSummary: "",
    forwardingOfficer: caseData?.officersInvolved[0] || "",
    forwardingDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate narrative from case data
  const generateNarrative = () => {
    if (!caseData) return;

    const narrative = `
COMPLAINT-CUM-PROSECUTION REPORT

Case Number: ${caseData.caseNumber}
Date of Registration: ${new Date(caseData.registrationDate).toLocaleDateString()}

INCIDENT DETAILS:
The incident occurred at ${caseData.incidentLocation} on ${new Date(caseData.raidStartTime).toLocaleDateString()} at approximately ${new Date(caseData.raidStartTime).toLocaleTimeString()}.

ACCUSED PERSONS:
${accusedList.map((accused, index) => `${index + 1}. ${accused.name}, S/o ${accused.fatherName}, Age: ${accused.age} years, Resident of: ${accused.district}, ${accused.state}`).join('\n')}

SECTIONS OF LAW APPLICABLE:
${caseData.sectionsOfLaw.join(', ')}

OFFICERS INVOLVED IN THE OPERATION:
${caseData.officersInvolved.join(', ')}

ARREST DETAILS:
${arrestMemos.length} arrest memo(s) prepared.
${arrestMemos.map((memo, index) => `Arrest ${index + 1}: ${new Date(memo.arrestDate).toLocaleDateString()} at ${memo.arrestTime}, Location: ${memo.arrestLocation}`).join('\n')}

SEIZURE DETAILS:
${seizureMemos.length > 0 ? `${seizureMemos.length} seizure memo(s) prepared with items seized from the accused.` : 'No items seized.'}

PERSONAL SEARCH:
${searchMemos.length > 0 ? `${searchMemos.length} personal search memo(s) prepared.` : 'Personal search pending.'}

MEDICAL EXAMINATION:
${medicalMemos.length > 0 ? `Medical examination conducted at ${medicalMemos[0]?.medicalInstitution || 'medical facility'}.` : 'Medical examination pending.'}

BNSS COMPLIANCE:
${bnssChecklists.length > 0 ? 'All BNSS compliance checklists completed and verified.' : 'BNSS compliance checklist pending.'}

The above facts constitute an offense under the applicable sections of law. The accused person(s) are being forwarded to the Honorable Court for appropriate legal proceedings.
    `.trim();

    const summary = `Accused ${accusedList.map(a => a.name).join(', ')} arrested for offenses under ${caseData.sectionsOfLaw.join(', ')}. All statutory documents prepared and enclosed. Request for judicial custody and trial as per law.`;

    setFormData((prev) => ({
      ...prev,
      narrative,
      prosecutionSummary: summary,
    }));
  };

  useEffect(() => {
    if (caseData && accusedList.length > 0) {
      generateNarrative();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.narrative.trim()) newErrors.narrative = "Narrative is required";
    if (!formData.prosecutionSummary.trim()) newErrors.prosecutionSummary = "Prosecution summary is required";
    if (!formData.forwardingOfficer.trim()) newErrors.forwardingOfficer = "Forwarding officer is required";
    if (!formData.forwardingDate) newErrors.forwardingDate = "Forwarding date is required";

    if (accusedList.length === 0) {
      newErrors.accused = "At least one accused must be added before forwarding";
    }

    if (arrestMemos.length === 0) {
      newErrors.memos = "At least one arrest memo must be created before forwarding";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const attachedMemos = [
      ...arrestMemos.map((m) => m.id),
      ...seizureMemos.map((m) => m.id),
      ...searchMemos.map((m) => m.id),
      ...medicalMemos.map((m) => m.id),
      ...bnssChecklists.map((c) => c.id),
    ];

    const newReport: CourtForwardingReport = {
      id: `court_forward_${Date.now()}`,
      caseId: params.id,
      narrative: formData.narrative,
      prosecutionSummary: formData.prosecutionSummary,
      attachedMemos,
      forwardingOfficer: formData.forwardingOfficer,
      forwardingDate: formData.forwardingDate,
      createdAt: now,
      updatedAt: now,
    };

    addCourtForwardingReport(newReport);
    alert("Court Forwarding Report saved successfully!");
    router.push(`/dashboard/cases/${params.id}/memos`);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Case not found</p>
      </div>
    );
  }

  const totalMemos = arrestMemos.length + seizureMemos.length + searchMemos.length + medicalMemos.length + bnssChecklists.length;

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
              Court Forwarding / Complaint-cum-PR Report
            </h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Case Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-gray-600 text-xs">Accused</p>
                      <p className="font-bold text-lg">{accusedList.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-gray-600 text-xs">Arrest Memos</p>
                      <p className="font-bold text-lg">{arrestMemos.length}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-gray-600 text-xs">Seizure Memos</p>
                      <p className="font-bold text-lg">{seizureMemos.length}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <p className="text-gray-600 text-xs">Total Documents</p>
                      <p className="font-bold text-lg">{totalMemos}</p>
                    </div>
                  </div>
                  {errors.accused && (
                    <p className="text-sm text-red-600 mt-2">{errors.accused}</p>
                  )}
                  {errors.memos && (
                    <p className="text-sm text-red-600 mt-2">{errors.memos}</p>
                  )}
                </CardContent>
              </Card>

              {/* Narrative Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Prosecution Narrative</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateNarrative}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Auto-generated from case data. You can edit as needed.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="narrative">Complete Narrative *</Label>
                    <Textarea
                      id="narrative"
                      value={formData.narrative}
                      onChange={(e) =>
                        setFormData({ ...formData, narrative: e.target.value })
                      }
                      placeholder="Detailed prosecution narrative with all facts"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    {errors.narrative && (
                      <p className="text-sm text-red-600 mt-1">{errors.narrative}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="prosecutionSummary">Prosecution Summary *</Label>
                    <Textarea
                      id="prosecutionSummary"
                      value={formData.prosecutionSummary}
                      onChange={(e) =>
                        setFormData({ ...formData, prosecutionSummary: e.target.value })
                      }
                      placeholder="Brief summary for court forwarding"
                      rows={3}
                    />
                    {errors.prosecutionSummary && (
                      <p className="text-sm text-red-600 mt-1">{errors.prosecutionSummary}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attached Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Attached Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {arrestMemos.length > 0 && (
                      <div className="p-3 border rounded">
                        <p className="font-semibold text-sm">Arrest Memos ({arrestMemos.length})</p>
                        <ul className="mt-2 ml-4 text-sm text-gray-600 list-disc">
                          {arrestMemos.map((memo, index) => (
                            <li key={memo.id}>
                              Arrest Memo {index + 1} - {new Date(memo.arrestDate).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {seizureMemos.length > 0 && (
                      <div className="p-3 border rounded">
                        <p className="font-semibold text-sm">Seizure Memos ({seizureMemos.length})</p>
                      </div>
                    )}
                    {searchMemos.length > 0 && (
                      <div className="p-3 border rounded">
                        <p className="font-semibold text-sm">Personal Search Memos ({searchMemos.length})</p>
                      </div>
                    )}
                    {medicalMemos.length > 0 && (
                      <div className="p-3 border rounded">
                        <p className="font-semibold text-sm">Medical Inspection Memos ({medicalMemos.length})</p>
                      </div>
                    )}
                    {bnssChecklists.length > 0 && (
                      <div className="p-3 border rounded">
                        <p className="font-semibold text-sm">BNSS Checklists ({bnssChecklists.length})</p>
                      </div>
                    )}
                    {totalMemos === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No documents attached yet. Create memos before forwarding to court.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Forwarding Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Forwarding Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="forwardingOfficer">Forwarding Officer *</Label>
                      <Input
                        id="forwardingOfficer"
                        value={formData.forwardingOfficer}
                        onChange={(e) =>
                          setFormData({ ...formData, forwardingOfficer: e.target.value })
                        }
                        placeholder="Enter officer name and designation"
                      />
                      {errors.forwardingOfficer && (
                        <p className="text-sm text-red-600 mt-1">{errors.forwardingOfficer}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="forwardingDate">Forwarding Date *</Label>
                      <Input
                        id="forwardingDate"
                        type="date"
                        value={formData.forwardingDate}
                        onChange={(e) =>
                          setFormData({ ...formData, forwardingDate: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.forwardingDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.forwardingDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Officer Signature Section */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-semibold mb-2">Officer&apos;s Signature</p>
                    <p className="text-xs text-gray-600">
                      After saving, this report will be available for officer&apos;s digital signature.
                      The system will generate a PDF with official letterhead and signature.
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
                        alert("PDF Preview - Would show formatted court forwarding report with RPF letterhead")
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save & Forward to Court
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