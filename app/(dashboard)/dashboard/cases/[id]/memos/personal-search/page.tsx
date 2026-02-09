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
import { ArrowLeft, Save, Plus, Trash2, FileDown } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";
import { PersonalSearchMemo, SearchedItem } from "@/lib/types/case";

export default function PersonalSearchMemoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const { addPersonalSearchMemo } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);

  const [formData, setFormData] = useState({
    accusedId: "",
    searchDate: new Date().toISOString().split("T")[0],
    searchTime: new Date().toTimeString().slice(0, 5),
    searchLocation: caseData?.incidentLocation || "",
    searchingOfficer: caseData?.officersInvolved[0] || "",
    witnesses: "",
    isNilSearch: false,
  });

  const [items, setItems] = useState<
    Array<{
      description: string;
      quantity: string;
      remarks: string;
    }>
  >([{ description: "", quantity: "1", remarks: "" }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", remarks: "" }]);
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

  const handleNilSearchChange = (checked: boolean) => {
    setFormData({ ...formData, isNilSearch: checked });
    if (checked) {
      // Clear items if nil search is selected
      setItems([{ description: "", quantity: "1", remarks: "" }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.accusedId) newErrors.accusedId = "Please select an accused";
    if (!formData.searchDate) newErrors.searchDate = "Search date is required";
    if (!formData.searchTime) newErrors.searchTime = "Search time is required";
    if (!formData.searchLocation) newErrors.searchLocation = "Search location is required";
    if (!formData.searchingOfficer) newErrors.searchingOfficer = "Searching officer is required";
    if (!formData.witnesses) newErrors.witnesses = "At least one witness is required";

    // Validate items if not nil search
    if (!formData.isNilSearch) {
      const hasValidItems = items.some(
        (item) => item.description.trim() && item.quantity && parseFloat(item.quantity) > 0
      );
      if (!hasValidItems) {
        newErrors.items = "At least one valid item is required (or check Nil Search)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const witnessArray = formData.witnesses.split(",").map((w) => w.trim()).filter(Boolean);

    const searchedItems: SearchedItem[] = formData.isNilSearch
      ? []
      : items
          .filter((item) => item.description.trim())
          .map((item, index) => ({
            id: `item_${Date.now()}_${index}`,
            description: item.description,
            quantity: parseFloat(item.quantity),
            remarks: item.remarks,
          }));

    const newSearchMemo: PersonalSearchMemo = {
      id: `personal_search_${Date.now()}`,
      caseId: params.id,
      accusedId: formData.accusedId,
      searchDate: formData.searchDate,
      searchTime: formData.searchTime,
      searchLocation: formData.searchLocation,
      itemsFound: searchedItems,
      isNilSearch: formData.isNilSearch,
      witnesses: witnessArray,
      searchingOfficer: formData.searchingOfficer,
      createdAt: now,
      updatedAt: now,
    };

    addPersonalSearchMemo(newSearchMemo);
    alert("Personal Search Memo saved successfully!");
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
            <p className="mb-4">Please add accused profiles before creating personal search memo.</p>
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
            <h1 className="text-xl font-bold text-gray-800">Personal Search Memo</h1>
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
                  <CardTitle>Search Details</CardTitle>
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
                      <Label htmlFor="searchDate">Search Date *</Label>
                      <Input
                        id="searchDate"
                        type="date"
                        value={formData.searchDate}
                        onChange={(e) =>
                          setFormData({ ...formData, searchDate: e.target.value })
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.searchDate && (
                        <p className="text-sm text-red-600 mt-1">{errors.searchDate}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="searchTime">Search Time *</Label>
                      <Input
                        id="searchTime"
                        type="time"
                        value={formData.searchTime}
                        onChange={(e) =>
                          setFormData({ ...formData, searchTime: e.target.value })
                        }
                      />
                      {errors.searchTime && (
                        <p className="text-sm text-red-600 mt-1">{errors.searchTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="searchLocation">Search Location *</Label>
                    <Textarea
                      id="searchLocation"
                      value={formData.searchLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, searchLocation: e.target.value })
                      }
                      placeholder="Enter detailed search location"
                      rows={2}
                    />
                    {errors.searchLocation && (
                      <p className="text-sm text-red-600 mt-1">{errors.searchLocation}</p>
                    )}
                  </div>

                  {/* Searching Officer */}
                  <div>
                    <Label htmlFor="searchingOfficer">Searching Officer *</Label>
                    <Input
                      id="searchingOfficer"
                      value={formData.searchingOfficer}
                      onChange={(e) =>
                        setFormData({ ...formData, searchingOfficer: e.target.value })
                      }
                      placeholder="Enter searching officer name and designation"
                    />
                    {errors.searchingOfficer && (
                      <p className="text-sm text-red-600 mt-1">{errors.searchingOfficer}</p>
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

                  {/* Nil Search Checkbox */}
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={formData.isNilSearch}
                        onCheckedChange={(checked) => handleNilSearchChange(checked === true)}
                      />
                      <div>
                        <p className="font-semibold text-sm">Nil Search</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Check this if nothing was found during the personal search
                        </p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Items Found Card */}
              {!formData.isNilSearch && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Items Found</CardTitle>
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

                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, "quantity", e.target.value)
                              }
                              min="0"
                              step="1"
                            />
                          </div>

                          <div>
                            <Label>Remarks</Label>
                            <Input
                              value={item.remarks}
                              onChange={(e) => updateItem(index, "remarks", e.target.value)}
                              placeholder="Any additional remarks"
                            />
                          </div>
                        </div>
                      ))}
                      {errors.items && (
                        <p className="text-sm text-red-600">{errors.items}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                        alert("PDF Preview - Would show formatted personal search memo")
                      }
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Search Memo
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