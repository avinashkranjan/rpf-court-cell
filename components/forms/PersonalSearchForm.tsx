/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/SignaturePad";
import OfficerCombobox from "@/components/ui/OfficerCombobox";
import { Loader2, Save, FileDown, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePersonalSearchPDF } from "@/lib/pdfGenerator";

interface PersonalSearchFormProps {
  caseId: string;
  accusedId: string;
  caseData: any;
  accused: any;
  onComplete: () => void;
}

interface SearchItem {
  item_name: string;
  quantity: number;
  description: string;
  remarks: string;
}

const PersonalSearchForm: React.FC<PersonalSearchFormProps> = ({
  caseId,
  accusedId,
  caseData,
  accused,
  onComplete,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingMemo, setExistingMemo] = useState<any>(null);

  const [formData, setFormData] = useState({
    search_date: new Date().toISOString().split("T")[0],
    search_time: new Date().toTimeString().slice(0, 5),
    search_place: caseData.incident_location || "",
    is_nil_search: false,
    cash_found: "0",
    articles_found: "",
    witness1_name: "",
    witness1_address: "",
    witness1_signature: "",
    witness2_name: "",
    witness2_address: "",
    witness2_signature: "",
    searching_officer_name: profile?.full_name || "",
    searching_officer_designation: profile?.designation || "",
    searching_officer_signature: "",
    accused_signature: "",
  });

  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from("personal_search_memos")
        .select("*")
        .eq("case_id", caseId)
        .eq("accused_id", accusedId)
        .single();

      if (data) {
        setExistingMemo(data);
        setFormData({
          search_date: data.search_date,
          search_time: data.search_time,
          search_place: data.search_place,
          is_nil_search: data.is_nil_search || false,
          cash_found: data.cash_found?.toString() || "0",
          articles_found: data.articles_found || "",
          witness1_name: data.witness1_name,
          witness1_address: data.witness1_address,
          witness1_signature: data.witness1_signature || "",
          witness2_name: data.witness2_name,
          witness2_address: data.witness2_address,
          witness2_signature: data.witness2_signature || "",
          searching_officer_name: data.searching_officer_name,
          searching_officer_designation: data.searching_officer_designation,
          searching_officer_signature: data.searching_officer_signature || "",
          accused_signature: data.accused_signature || "",
        });

        // Fetch search items
        const { data: items } = await supabase
          .from("personal_search_items")
          .select("*")
          .eq("search_memo_id", data.id);

        if (items && items.length > 0) {
          setSearchItems(
            items.map((item) => ({
              item_name: item.item_name,
              quantity: item.quantity,
              description: item.description || "",
              remarks: item.remarks || "",
            })),
          );
        }
      }
    };
    fetchExisting();
  }, [caseId, accusedId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (
    index: number,
    field: keyof SearchItem,
    value: string | number,
  ) => {
    const updated = [...searchItems];
    (updated[index] as any)[field] = value;
    setSearchItems(updated);
  };

  const addItem = () => {
    setSearchItems([
      ...searchItems,
      { item_name: "", quantity: 1, description: "", remarks: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setSearchItems(searchItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memoData = {
        case_id: caseId,
        accused_id: accusedId,
        search_date: formData.search_date,
        search_time: formData.search_time,
        search_place: formData.search_place,
        is_nil_search: formData.is_nil_search,
        cash_found: parseFloat(formData.cash_found) || 0,
        articles_found: formData.articles_found || null,
        witness1_name: formData.witness1_name,
        witness1_address: formData.witness1_address,
        witness1_signature: formData.witness1_signature || null,
        witness2_name: formData.witness2_name,
        witness2_address: formData.witness2_address,
        witness2_signature: formData.witness2_signature || null,
        searching_officer_name: formData.searching_officer_name,
        searching_officer_designation: formData.searching_officer_designation,
        searching_officer_signature:
          formData.searching_officer_signature || null,
        accused_signature: formData.accused_signature || null,
        is_completed: complete,
      };

      let memoId: string;

      if (existingMemo) {
        const { error } = await supabase
          .from("personal_search_memos")
          .update(memoData)
          .eq("id", existingMemo.id);

        if (error) throw error;
        memoId = existingMemo.id;

        await supabase
          .from("personal_search_items")
          .delete()
          .eq("search_memo_id", memoId);
      } else {
        const { data, error } = await supabase
          .from("personal_search_memos")
          .insert(memoData)
          .select()
          .single();

        if (error) throw error;
        memoId = data.id;
      }

      // Insert search items
      if (!formData.is_nil_search && searchItems.length > 0) {
        const itemsToInsert = searchItems
          .filter((item) => item.item_name.trim())
          .map((item) => ({
            search_memo_id: memoId,
            item_name: item.item_name,
            quantity: item.quantity,
            description: item.description || null,
            remarks: item.remarks || null,
          }));

        if (itemsToInsert.length > 0) {
          const { error: itemError } = await supabase
            .from("personal_search_items")
            .insert(itemsToInsert);
          if (itemError) throw itemError;
        }
      }

      toast({
        title: complete
          ? "Personal Search Memo Completed"
          : "Personal Search Memo Saved",
        description: complete
          ? "Proceeding to next step..."
          : "Draft saved successfully",
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Error saving personal search memo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save personal search memo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePersonalSearchPDF({ ...formData, caseData, accused, searchItems });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Search Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search_date">Date of Search *</Label>
          <Input
            id="search_date"
            type="date"
            value={formData.search_date}
            onChange={(e) => handleChange("search_date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="search_time">Time of Search *</Label>
          <Input
            id="search_time"
            type="time"
            value={formData.search_time}
            onChange={(e) => handleChange("search_time", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="search_place">Place of Search *</Label>
          <Input
            id="search_place"
            value={formData.search_place}
            onChange={(e) => handleChange("search_place", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Nil Search */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_nil_search"
          checked={formData.is_nil_search}
          onCheckedChange={(checked) =>
            handleChange("is_nil_search", checked as boolean)
          }
        />
        <Label htmlFor="is_nil_search">Nil Search (Nothing found)</Label>
      </div>

      {/* Items Found */}
      {!formData.is_nil_search && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cash_found">Cash Found (₹)</Label>
              <Input
                id="cash_found"
                type="number"
                value={formData.cash_found}
                onChange={(e) => handleChange("cash_found", e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Articles Found</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            {searchItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border rounded-lg"
              >
                <div className="md:col-span-2 space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    value={item.item_name}
                    onChange={(e) =>
                      handleItemChange(index, "item_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input
                    value={item.remarks}
                    onChange={(e) =>
                      handleItemChange(index, "remarks", e.target.value)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="articles_found">
              Additional Articles Description
            </Label>
            <Textarea
              id="articles_found"
              value={formData.articles_found}
              onChange={(e) => handleChange("articles_found", e.target.value)}
              placeholder="Describe any other articles found..."
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Witness 1 */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Witness 1</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.witness1_name}
              onChange={(e) => handleChange("witness1_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={formData.witness1_address}
              onChange={(e) => handleChange("witness1_address", e.target.value)}
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Witness 1 Signature"
          value={formData.witness1_signature}
          onChange={(sig) => handleChange("witness1_signature", sig)}
        />
      </div>

      {/* Witness 2 */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Witness 2</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.witness2_name}
              onChange={(e) => handleChange("witness2_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={formData.witness2_address}
              onChange={(e) => handleChange("witness2_address", e.target.value)}
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Witness 2 Signature"
          value={formData.witness2_signature}
          onChange={(sig) => handleChange("witness2_signature", sig)}
        />
      </div>

      {/* Searching Officer */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Searching Officer</Label>
        <div className="space-y-2">
          <Label>Select Officer *</Label>
          <OfficerCombobox
            value={undefined}
            onChange={(id, officer) => {
              if (officer) {
                setFormData({
                  ...formData,
                  searching_officer_name: officer.full_name,
                  searching_officer_designation: officer.designation,
                });
              }
            }}
            placeholder="Search and select officer..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.searching_officer_name}
              onChange={(e) =>
                handleChange("searching_officer_name", e.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Designation *</Label>
            <Input
              value={formData.searching_officer_designation}
              onChange={(e) =>
                handleChange("searching_officer_designation", e.target.value)
              }
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Officer Signature"
          value={formData.searching_officer_signature}
          onChange={(sig) => handleChange("searching_officer_signature", sig)}
          required
        />
      </div>

      {/* Accused Signature */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">
          Accused Acknowledgment
        </Label>
        <SignaturePad
          label="Accused Signature"
          value={formData.accused_signature}
          onChange={(sig) => handleChange("accused_signature", sig)}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        {existingMemo?.is_completed && (
          <Button type="button" variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
        <Button type="submit" variant="outline" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete & Next
        </Button>
      </div>
    </form>
  );
};

export default PersonalSearchForm;
