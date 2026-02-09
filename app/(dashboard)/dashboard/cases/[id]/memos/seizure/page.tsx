"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Camera, FileDown } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { SeizureMemo, SeizedItem } from "@/lib/types/case";

export default function SeizureMemoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const { addSeizureMemo } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);

  const [formData, setFormData] = useState({
    accusedId: "",
    seizureDate: new Date().toISOString().split("T")[0],
    seizureTime: new Date().toTimeString().slice(0, 5),
    seizureLocation: caseData?.incidentLocation || "",
    seizingOfficer: caseData?.officersInvolved[0] || "",
    witnesses: "",
  });

  const [items, setItems] = useState<
    Array<{
      description: string;
      quantity: string;
      unit: string;
      remarks: string;
    }>
  >([{ description: "", quantity: "1", unit: "nos", remarks: "" }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unit: "nos", remarks: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accusedId) newErrors.accusedId = "Please select an accused";
    if (!formData.seizureDate) newErrors.seizureDate = "Seizure date is required";
    if (!formData.seizureTime) newErrors.seizureTime = "Seizure time is required";
    if (!formData.seizureLocation) newErrors.seizureLocation = "Seizure location is required";
    if (!formData.seizingOfficer) newErrors.seizingOfficer = "Seizing officer is required";
    if (!formData.witnesses) newErrors.witnesses = "At least one witness is required";

    // Validate items
    const hasValidItems = items.some(
      (item) => item.description.trim() && item.quantity && parseFloat(item.quantity) > 0
    );
    if (!hasValidItems) {
      newErrors.items = "At least one valid item is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const witnessArray = formData.witnesses.split(",").map((w) => w.trim()).filter(Boolean);

    const seizedItems: SeizedItem[] = items
      .filter((item) => item.description.trim())
      .map((item, index) => ({
        id: `item_${Date.now()}_${index}`,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        remarks: item.remarks,
        photos: [],
      }));

    const newSeizureMemo: SeizureMemo = {
      id: `seizure_memo_${Date.now()}`,
      caseId: params.id,
      accusedId: formData.accusedId,
      seizureDate: formData.seizureDate,
      seizureTime: formData.seizureTime,
      seizureLocation: formData.seizureLocation,
      items: seizedItems,
      witnesses: witnessArray,
      seizingOfficer: formData.seizingOfficer,
      createdAt: now,
      updatedAt: now,
    };

    addSeizureMemo(newSeizureMemo);
    alert("Seizure Memo saved successfully!");
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
            <p className="mb-4">Please add accused profiles before creating seizure memo.</p>
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
            <h1 className="text-xl font-bold text-gray-800">Seizure Memo</h1>
            <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Basic Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Seizure Details</CardTitle>
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

                  {selectedAccused && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-semibold">Selected Accused:</p>
                      <p className="text-sm mt-1">
                        {selectedAccused.name} S/o {selectedAccused.fatherName}
                      </p>
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="seizureDate">Seizure Date *</Label>
                      <Input
                        id="seizureDate"
                        type="date"
                        value={formData.seizureDate}
                        onChange={(e) =>
                          setFormData({ ...formData, seizureDate: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.seizureDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.seizureDate}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="seizureTime">Seizure Time *</Label>
                      <Input
                        id="seizureTime"
                        type="time"
                        value={formData.seizureTime}
                        onChange={(e) =>
                          setFormData({ ...formData, seizureTime: e.target.value })
                        }
                      />
                      {errors.seizureTime && (
                        <p className="text-sm text-red-600 mt-1">{errors.seizureTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="seizureLocation">Seizure Location *</Label>
                    <Textarea
                      id="seizureLocation"
                      value={formData.seizureLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, seizureLocation: e.target.value })
                      }
                      placeholder="Enter detailed seizure location"
                      rows={2}
                    />
                    {errors.seizureLocation && (
                      <p className="text-sm text-red-600 mt-1">{errors.seizureLocation}</p>
                    )}
                  </div>

                  {/* Seizing Officer */}
                  <div>
                    <Label htmlFor="seizingOfficer">Seizing Officer *</Label>
                    <Input
                      id="seizingOfficer"
                      value={formData.seizingOfficer}
                      onChange={(e) =>
                        setFormData({ ...formData, seizingOfficer: e.target.value })
                      }
                      placeholder="Enter seizing officer name and designation"
                    />
                    {errors.seizingOfficer && (
                      <p className="text-sm text-red-600 mt-1">{errors.seizingOfficer}</p>
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
                  </div>
                </CardContent>
              </Card>

              {/* Seized Items Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Seized Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 border rounded space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">Item #{index + 1}</span>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label>Item Description *</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            placeholder="Enter item description"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, "quantity", e.target.value)
                              }
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) => updateItem(index, "unit", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nos">Nos</SelectItem>
                                <SelectItem value="kg">Kg</SelectItem>
                                <SelectItem value="grams">Grams</SelectItem>
                                <SelectItem value="liters">Liters</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="packets">Packets</SelectItem>
                                <SelectItem value="bottles">Bottles</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Remarks</Label>
                          <Input
                            value={item.remarks}
                            onChange={(e) => updateItem(index, "remarks", e.target.value)}
                            placeholder="Any additional remarks"
                          />
                        </div>

                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              alert("Photo upload feature - would open camera/file picker")
                            }
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Add Photo
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            Add photos of seized items for documentation
                          </p>
                        </div>
                      </div>
                    ))}
                    {errors.items && (
                      <p className="text-sm text-red-600">{errors.items}</p>
                    )}
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
                        alert("PDF Preview - Would show formatted seizure memo")
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Seizure Memo
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