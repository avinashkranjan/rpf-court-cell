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
import { Loader2, Save, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateArrestMemoPDF } from "@/lib/pdfGenerator";

interface ArrestMemoFormProps {
  caseId: string;
  accusedId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  caseData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accused: any;
  onComplete: () => void;
}

const ArrestMemoForm: React.FC<ArrestMemoFormProps> = ({
  caseId,
  accusedId,
  caseData,
  accused,
  onComplete,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingMemo, setExistingMemo] = useState<any>(null);

  const [formData, setFormData] = useState({
    arrest_date: new Date().toISOString().split("T")[0],
    arrest_time: new Date().toTimeString().slice(0, 5),
    arrest_place: caseData.incident_location || "",
    detention_place: caseData.post_name || "",
    gd_entry_number: caseData.gd_entry_number || "",
    vehicle_registration: "",
    court_name: caseData.court_name || "",
    court_production_date: caseData.court_production_date || "",
    court_production_time: caseData.court_production_time || "",
    arresting_officer_name: profile?.full_name || "",
    arresting_officer_designation: profile?.designation || "",
    arresting_officer_signature: "",
    witness1_name: "",
    witness1_address: "",
    witness1_signature: "",
    witness2_name: "",
    witness2_address: "",
    witness2_signature: "",
    has_injuries: false,
    injury_details: "",
    accused_signature: "",
    accused_thumb_impression: "",
  });

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from("arrest_memos")
        .select("*")
        .eq("case_id", caseId)
        .eq("accused_id", accusedId)
        .single();

      if (data) {
        setExistingMemo(data);
        setFormData({
          arrest_date: data.arrest_date,
          arrest_time: data.arrest_time,
          arrest_place: data.arrest_place,
          detention_place: data.detention_place,
          gd_entry_number: data.gd_entry_number,
          vehicle_registration: data.vehicle_registration || "",
          court_name: data.court_name,
          court_production_date: data.court_production_date,
          court_production_time: data.court_production_time,
          arresting_officer_name: data.arresting_officer_name,
          arresting_officer_designation: data.arresting_officer_designation,
          arresting_officer_signature: data.arresting_officer_signature || "",
          witness1_name: data.witness1_name,
          witness1_address: data.witness1_address,
          witness1_signature: data.witness1_signature || "",
          witness2_name: data.witness2_name,
          witness2_address: data.witness2_address,
          witness2_signature: data.witness2_signature || "",
          has_injuries: data.has_injuries || false,
          injury_details: data.injury_details || "",
          accused_signature: data.accused_signature || "",
          accused_thumb_impression: data.accused_thumb_impression || "",
        });
      }
    };
    fetchExisting();
  }, [caseId, accusedId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memoData = {
        case_id: caseId,
        accused_id: accusedId,
        arrest_date: formData.arrest_date,
        arrest_time: formData.arrest_time,
        arrest_place: formData.arrest_place,
        detention_place: formData.detention_place,
        gd_entry_number: formData.gd_entry_number,
        vehicle_registration: formData.vehicle_registration || null,
        court_name: formData.court_name,
        court_production_date: formData.court_production_date,
        court_production_time: formData.court_production_time,
        arresting_officer_name: formData.arresting_officer_name,
        arresting_officer_designation: formData.arresting_officer_designation,
        arresting_officer_signature:
          formData.arresting_officer_signature || null,
        witness1_name: formData.witness1_name,
        witness1_address: formData.witness1_address,
        witness1_signature: formData.witness1_signature || null,
        witness2_name: formData.witness2_name,
        witness2_address: formData.witness2_address,
        witness2_signature: formData.witness2_signature || null,
        has_injuries: formData.has_injuries,
        injury_details: formData.injury_details || null,
        accused_signature: formData.accused_signature || null,
        accused_thumb_impression: formData.accused_thumb_impression || null,
        is_completed: complete,
      };

      if (existingMemo) {
        const { error } = await supabase
          .from("arrest_memos")
          .update(memoData)
          .eq("id", existingMemo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("arrest_memos").insert(memoData);
        if (error) throw error;
      }

      toast({
        title: complete ? "Arrest Memo Completed" : "Arrest Memo Saved",
        description: complete
          ? "Proceeding to next step..."
          : "Draft saved successfully",
      });

      if (complete) {
        onComplete();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving arrest memo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save arrest memo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateArrestMemoPDF({ ...formData, caseData, accused });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Arrest Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="arrest_date">Date of Arrest *</Label>
          <Input
            id="arrest_date"
            type="date"
            value={formData.arrest_date}
            onChange={(e) => handleChange("arrest_date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrest_time">Time of Arrest *</Label>
          <Input
            id="arrest_time"
            type="time"
            value={formData.arrest_time}
            onChange={(e) => handleChange("arrest_time", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrest_place">Place of Arrest *</Label>
          <Input
            id="arrest_place"
            value={formData.arrest_place}
            onChange={(e) => handleChange("arrest_place", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="detention_place">Detention Place *</Label>
          <Input
            id="detention_place"
            value={formData.detention_place}
            onChange={(e) => handleChange("detention_place", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gd_entry_number">GD Entry Number *</Label>
          <Input
            id="gd_entry_number"
            value={formData.gd_entry_number}
            onChange={(e) => handleChange("gd_entry_number", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="court_name">Court Name *</Label>
          <Input
            id="court_name"
            value={formData.court_name}
            onChange={(e) => handleChange("court_name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="court_production_date">Court Production Date *</Label>
          <Input
            id="court_production_date"
            type="date"
            value={formData.court_production_date}
            onChange={(e) =>
              handleChange("court_production_date", e.target.value)
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="court_production_time">Court Production Time *</Label>
          <Input
            id="court_production_time"
            type="time"
            value={formData.court_production_time}
            onChange={(e) =>
              handleChange("court_production_time", e.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicle_registration">
          Vehicle Registration (if applicable)
        </Label>
        <Input
          id="vehicle_registration"
          value={formData.vehicle_registration}
          onChange={(e) => handleChange("vehicle_registration", e.target.value)}
          placeholder="Vehicle used for transportation"
        />
      </div>

      {/* Injury Details */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_injuries"
            checked={formData.has_injuries}
            onCheckedChange={(checked) =>
              handleChange("has_injuries", checked as boolean)
            }
          />
          <Label htmlFor="has_injuries">Accused has visible injuries</Label>
        </div>
        {formData.has_injuries && (
          <div className="space-y-2">
            <Label htmlFor="injury_details">Injury Details</Label>
            <Textarea
              id="injury_details"
              value={formData.injury_details}
              onChange={(e) => handleChange("injury_details", e.target.value)}
              placeholder="Describe visible injuries..."
              rows={3}
            />
          </div>
        )}
      </div>

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

      {/* Arresting Officer */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Arresting Officer</Label>
        <div className="space-y-2">
          <Label>Select Officer *</Label>
          <OfficerCombobox
            value={undefined}
            onChange={(id, officer) => {
              if (officer) {
                setFormData({
                  ...formData,
                  arresting_officer_name: officer.full_name,
                  arresting_officer_designation: officer.designation,
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
              value={formData.arresting_officer_name}
              onChange={(e) =>
                handleChange("arresting_officer_name", e.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Designation *</Label>
            <Input
              value={formData.arresting_officer_designation}
              onChange={(e) =>
                handleChange("arresting_officer_designation", e.target.value)
              }
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Officer Signature"
          value={formData.arresting_officer_signature}
          onChange={(sig) => handleChange("arresting_officer_signature", sig)}
          required
        />
      </div>

      {/* Accused Signature */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">
          Accused Acknowledgment
        </Label>
        <SignaturePad
          label="Accused Signature / Thumb Impression"
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

export default ArrestMemoForm;
