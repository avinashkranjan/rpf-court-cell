"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, FileDown, AlertCircle } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { BNSSArrestChecklist, ChecklistItem } from "@/lib/types/case";

// BNSS Mandatory Grounds for Arrest
const BNSS_GROUNDS = [
  {
    id: "ground_1",
    description: "The arrest is necessary to prevent the accused from committing any further offence",
    mandatory: true,
  },
  {
    id: "ground_2",
    description: "The arrest is necessary for proper investigation of the offence",
    mandatory: true,
  },
  {
    id: "ground_3",
    description: "The arrest is necessary to prevent the accused from causing disappearance of evidence",
    mandatory: true,
  },
  {
    id: "ground_4",
    description: "The arrest is necessary to prevent the accused from making threat or promise to any person",
    mandatory: true,
  },
  {
    id: "ground_5",
    description: "The arrest is necessary to prevent the accused from fleeing from justice",
    mandatory: true,
  },
  {
    id: "ground_6",
    description: "The officer has credible information that the accused has committed a cognizable offence",
    mandatory: true,
  },
  {
    id: "ground_7",
    description: "Reasonable suspicion exists that the accused has committed the alleged offence",
    mandatory: true,
  },
  {
    id: "ground_8",
    description: "The identity and residence of the accused could not be satisfactorily established",
    mandatory: false,
  },
  {
    id: "ground_9",
    description: "The accused has been informed of grounds of arrest in a language understood by them",
    mandatory: true,
  },
  {
    id: "ground_10",
    description: "The accused has been informed of their right to bail",
    mandatory: true,
  },
  {
    id: "ground_11",
    description: "A memo of arrest has been prepared and copy furnished to the accused",
    mandatory: true,
  },
  {
    id: "ground_12",
    description: "The accused has been informed of their right to consult a legal practitioner",
    mandatory: true,
  },
];

export default function BNSSChecklistPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const { addBNSSChecklist } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);

  const [formData, setFormData] = useState({
    accusedId: "",
    officerName: caseData?.officersInvolved[0] || "",
    attestationDate: new Date().toISOString().split("T")[0],
  });

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string>("");

  const handleCheckboxChange = (groundId: string, checked: boolean) => {
    setCheckedItems({ ...checkedItems, [groundId]: checked });
    setValidationError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accusedId) newErrors.accusedId = "Please select an accused";
    if (!formData.officerName) newErrors.officerName = "Officer name is required";
    if (!formData.attestationDate) newErrors.attestationDate = "Attestation date is required";

    // Validate that all mandatory grounds are checked
    const uncheckedMandatory = BNSS_GROUNDS.filter(
      (ground) => ground.mandatory && !checkedItems[ground.id]
    );

    if (uncheckedMandatory.length > 0) {
      setValidationError(
        "All mandatory grounds must be checked to proceed. Please review the unchecked mandatory items."
      );
      newErrors.checklist = "Complete all mandatory checks";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const checklistItems: ChecklistItem[] = BNSS_GROUNDS.map((ground) => ({
      id: ground.id,
      description: ground.description,
      checked: checkedItems[ground.id] || false,
      mandatory: ground.mandatory,
    }));

    const newChecklist: BNSSArrestChecklist = {
      id: `bnss_checklist_${Date.now()}`,
      caseId: params.id,
      accusedId: formData.accusedId,
      grounds: checklistItems,
      officerName: formData.officerName,
      attestationDate: formData.attestationDate,
      createdAt: now,
      updatedAt: now,
    };

    addBNSSChecklist(newChecklist);
    alert("BNSS Arrest Checklist saved successfully!");
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
            <p className="mb-4">Please add accused profiles before creating BNSS checklist.</p>
            <Button onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}>
              Add Accused Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAccused = accusedList.find((a) => a.id === formData.accusedId);
  const mandatoryCount = BNSS_GROUNDS.filter((g) => g.mandatory).length;
  const checkedMandatoryCount = BNSS_GROUNDS.filter(
    (g) => g.mandatory && checkedItems[g.id]
  ).length;

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
            <h1 className="text-xl font-bold text-gray-800">BNSS Arrest Checklist</h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Information Card */}
            <Card className="mb-4 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">
                      Bharatiya Nagarik Suraksha Sanhita (BNSS) Compliance
                    </p>
                    <p>
                      This checklist ensures compliance with BNSS provisions for arrest. All
                      mandatory grounds must be satisfied before proceeding with arrest.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accused and Officer Details */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Arrest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Select Accused */}
                <div>
                  <Label htmlFor="accusedId">Select Accused *</Label>
                  <Select
                    id="accusedId"
                    value={formData.accusedId}
                    onChange={(e) => setFormData({ ...formData, accusedId: e.target.value })}
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
                    <p className="text-sm font-semibold">Selected Accused:</p>
                    <p className="text-sm mt-1">
                      {selectedAccused.name} S/o {selectedAccused.fatherName}, Age:{" "}
                      {selectedAccused.age}
                    </p>
                  </div>
                )}

                {/* Officer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officerName">Arresting Officer *</Label>
                    <Input
                      id="officerName"
                      value={formData.officerName}
                      onChange={(e) =>
                        setFormData({ ...formData, officerName: e.target.value })
                      }
                      placeholder="Enter officer name and designation"
                    />
                    {errors.officerName && (
                      <p className="text-sm text-red-600 mt-1">{errors.officerName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="attestationDate">Attestation Date *</Label>
                    <Input
                      id="attestationDate"
                      type="date"
                      value={formData.attestationDate}
                      onChange={(e) =>
                        setFormData({ ...formData, attestationDate: e.target.value })
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {errors.attestationDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.attestationDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Mandatory Checks Completed:
                  </span>
                  <span className="text-lg font-bold">
                    {checkedMandatoryCount} / {mandatoryCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      checkedMandatoryCount === mandatoryCount
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${(checkedMandatoryCount / mandatoryCount) * 100}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Error */}
            {validationError && (
              <Card className="mb-4 border-red-300 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{validationError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* BNSS Grounds Checklist */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>BNSS Arrest Grounds</CardTitle>
                <p className="text-sm text-gray-600">
                  Check all applicable grounds. Items marked with * are mandatory.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {BNSS_GROUNDS.map((ground, index) => (
                    <div
                      key={ground.id}
                      className={`p-4 border rounded ${
                        ground.mandatory
                          ? checkedItems[ground.id]
                            ? "border-green-300 bg-green-50"
                            : "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={checkedItems[ground.id] || false}
                          onChange={(e) =>
                            handleCheckboxChange(ground.id, e.target.checked)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              Ground {index + 1}
                            </span>
                            {ground.mandatory && (
                              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                                MANDATORY
                              </span>
                            )}
                          </div>
                          <p className="text-sm mt-1">{ground.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.checklist && (
                  <p className="text-sm text-red-600 mt-2">{errors.checklist}</p>
                )}
              </CardContent>
            </Card>

            {/* Officer Attestation */}
            <Card className="mb-4 border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">Officer Attestation</p>
                <p className="text-xs text-gray-700">
                  I hereby attest that the above grounds have been duly satisfied and the
                  arrest has been conducted in accordance with the provisions of Bharatiya
                  Nagarik Suraksha Sanhita (BNSS). The accused has been informed of their
                  rights and the grounds of arrest in a language understood by them.
                </p>
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
                      alert("PDF Preview - Would show formatted BNSS checklist")
                    }
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Preview PDF
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={checkedMandatoryCount !== mandatoryCount}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Checklist
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