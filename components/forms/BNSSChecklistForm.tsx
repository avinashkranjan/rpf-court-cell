/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SignaturePad from "@/components/SignaturePad";
import OfficerCombobox from "@/components/ui/OfficerCombobox";
import { Loader2, Save, FileDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateBNSSChecklistPDF } from "@/lib/pdfGenerator";

interface BNSSChecklistFormProps {
  caseId: string;
  accusedId: string;
  caseData: any;
  accused: any;
  onComplete: () => void;
}

const BNSSChecklistForm: React.FC<BNSSChecklistFormProps> = ({
  caseId,
  accusedId,
  caseData,
  accused,
  onComplete,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingChecklist, setExistingChecklist] = useState<any>(null);

  const [formData, setFormData] = useState({
    ground_a_prevent_offence: false,
    ground_b_proper_investigation: false,
    ground_c_evidence_protection: false,
    ground_d_prevent_inducement: false,
    ground_e_ensure_court_presence: false,
    officer_name: profile?.full_name || "",
    officer_designation: profile?.designation || "",
    officer_signature: "",
  });

  const grounds = [
    {
      key: "ground_a_prevent_offence",
      label: "(a) To prevent such person from committing any further offence",
    },
    {
      key: "ground_b_proper_investigation",
      label: "(b) For proper investigation of the offence",
    },
    {
      key: "ground_c_evidence_protection",
      label:
        "(c) To prevent such person from causing the evidence of the offence to disappear or tampering with such evidence in any manner",
    },
    {
      key: "ground_d_prevent_inducement",
      label:
        "(d) To prevent such person from making any inducement, threat or promise to any person acquainted with the facts of the case so as to dissuade him from disclosing such facts to the Court or to the police officer",
    },
    {
      key: "ground_e_ensure_court_presence",
      label:
        "(e) As unless such person is arrested, his presence in the Court whenever required cannot be ensured",
    },
  ];

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from("bnss_checklists")
        .select("*")
        .eq("case_id", caseId)
        .eq("accused_id", accusedId)
        .single();

      if (data) {
        setExistingChecklist(data);
        setFormData({
          ground_a_prevent_offence: data.ground_a_prevent_offence || false,
          ground_b_proper_investigation:
            data.ground_b_proper_investigation || false,
          ground_c_evidence_protection:
            data.ground_c_evidence_protection || false,
          ground_d_prevent_inducement:
            data.ground_d_prevent_inducement || false,
          ground_e_ensure_court_presence:
            data.ground_e_ensure_court_presence || false,
          officer_name: data.officer_name,
          officer_designation: data.officer_designation,
          officer_signature: data.officer_signature || "",
        });
      }
    };
    fetchExisting();
  }, [caseId, accusedId]);

  const handleChange = (field: string, value: boolean | string) => {
    setFormData({ ...formData, [field]: value });
  };

  const atLeastOneSelected =
    formData.ground_a_prevent_offence ||
    formData.ground_b_proper_investigation ||
    formData.ground_c_evidence_protection ||
    formData.ground_d_prevent_inducement ||
    formData.ground_e_ensure_court_presence;

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();

    if (complete && !atLeastOneSelected) {
      toast({
        title: "Validation Error",
        description: "At least one ground of arrest must be selected",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const checklistData = {
        case_id: caseId,
        accused_id: accusedId,
        ground_a_prevent_offence: formData.ground_a_prevent_offence,
        ground_b_proper_investigation: formData.ground_b_proper_investigation,
        ground_c_evidence_protection: formData.ground_c_evidence_protection,
        ground_d_prevent_inducement: formData.ground_d_prevent_inducement,
        ground_e_ensure_court_presence: formData.ground_e_ensure_court_presence,
        officer_name: formData.officer_name,
        officer_designation: formData.officer_designation,
        officer_signature: formData.officer_signature || null,
        is_completed: complete,
      };

      if (existingChecklist) {
        const { error } = await supabase
          .from("bnss_checklists")
          .update(checklistData)
          .eq("id", existingChecklist.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bnss_checklists")
          .insert(checklistData);
        if (error) throw error;
      }

      toast({
        title: complete ? "BNSS Checklist Completed" : "BNSS Checklist Saved",
        description: complete
          ? "Proceeding to next step..."
          : "Draft saved successfully",
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Error saving BNSS checklist:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save checklist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateBNSSChecklistPDF({ ...formData, caseData, accused });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Header Info */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm">
          This notice is issued to inform the arrested person about the grounds
          of arrest in compliance with <strong>Section 35 of BNSS</strong>.
        </p>
        <p className="text-sm mt-2">
          <strong>Case Reference:</strong> {caseData.case_number}, Dtd-
          {new Date(caseData.case_date).toLocaleDateString()} U/S-
          {caseData.section_of_law} of the Railway Act, 1989
        </p>
        <p className="text-sm mt-2">
          <strong>Name and address of the accused:</strong> {accused.full_name},
          Mob No- {accused.mobile_number || "N/A"}, {accused.gender}-
          {accused.age} Yrs, S/O- {accused.father_name} of{" "}
          {accused.address_line1}, P.O- {accused.post_office || "N/A"}, P.S-{" "}
          {accused.police_station || "N/A"}, Dist- {accused.district},{" "}
          {accused.state}-{accused.pincode || "N/A"}
        </p>
      </div>

      {/* Grounds of Arrest */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Grounds of Arrest</Label>
          {!atLeastOneSelected && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              At least one required
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Arresting is being made on the ground of ticked below:
        </p>

        <div className="space-y-4 p-4 border rounded-lg">
          {grounds.map((ground) => (
            <div key={ground.key} className="flex items-start space-x-3">
              <Checkbox
                id={ground.key}
                checked={
                  formData[ground.key as keyof typeof formData] as boolean
                }
                onCheckedChange={(checked) =>
                  handleChange(ground.key, checked as boolean)
                }
              />
              <Label
                htmlFor={ground.key}
                className="text-sm leading-relaxed cursor-pointer"
              >
                {ground.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Officer Details */}
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
                  officer_name: officer.full_name,
                  officer_designation: officer.designation,
                });
              }
            }}
            placeholder="Search and select officer..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.officer_name}
              onChange={(e) => handleChange("officer_name", e.target.value)}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input
              value={formData.officer_designation}
              onChange={(e) =>
                handleChange("officer_designation", e.target.value)
              }
              readOnly
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{caseData.post_name}</p>
        <SignaturePad
          label="Officer Signature"
          value={formData.officer_signature}
          onChange={(sig) => handleChange("officer_signature", sig)}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        {existingChecklist?.is_completed && (
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
          disabled={loading || !atLeastOneSelected}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete & Next
        </Button>
      </div>
    </form>
  );
};

export default BNSSChecklistForm;
