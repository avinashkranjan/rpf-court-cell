/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StepIndicator from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignaturePad from "@/components/SignaturePad";
import OfficerCombobox from "@/components/ui/OfficerCombobox";
import ArrestMemoForm from "@/components/forms/ArrestMemoForm";
import PersonalSearchForm from "@/components/forms/PersonalSearchForm";
import MedicalMemoForm from "@/components/forms/MedicalMemoForm";
import BNSSChecklistForm from "@/components/forms/BNSSChecklistForm";
import AccusedChallanForm from "@/components/forms/AccusedChallanForm";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface RailwayPost {
  id: string;
  zone_name: string;
  division: string;
  post_name: string;
  court_name: string | null;
  court_jurisdiction: string | null;
}

interface LawSection {
  id: string;
  section_code: string;
  act_name: string;
  description: string | null;
  is_bailable: boolean | null;
}

interface SeizedItem {
  item_name: string;
  quantity: number;
  unit: string;
  description: string;
  remarks: string;
}

const steps = [
  { id: 1, name: "Seizure Memo", shortName: "Seizure" },
  { id: 2, name: "Arrest Memo", shortName: "Arrest" },
  { id: 3, name: "Personal Search", shortName: "Search" },
  { id: 4, name: "Medical Certificate", shortName: "Medical" },
  { id: 5, name: "BNSS Checklist", shortName: "Checklist" },
  { id: 6, name: "Accused Challan", shortName: "Challan" },
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

const NewCase: React.FC = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [posts, setPosts] = useState<RailwayPost[]>([]);
  const [sections, setSections] = useState<LawSection[]>([]);

  // Created IDs after Step 1
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [createdAccusedId, setCreatedAccusedId] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<any>(null);
  const [accusedData, setAccusedData] = useState<any>(null);
  const [accusedList, setAccusedList] = useState<any[]>([]);

  // Step 1: Case + Accused + Seizure combined form
  const [caseForm, setCaseForm] = useState({
    railway_zone: profile?.railway_zone || "",
    post_name: profile?.post_name || "",
    jurisdiction: "",
    section_of_law: "",
    incident_location: "",
    platform_number: "",
    station_name: "",
    train_number: "",
    train_name: "",
    coach_number: "",
    raid_start_time: "",
    raid_end_time: "",
    gd_entry_number: "",
    court_name: "",
    court_production_date: "",
    court_production_time: "",
    remarks: "",
  });

  const [accusedForm, setAccusedForm] = useState({
    full_name: "",
    father_name: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    mobile_number: "",
    address_line1: "",
    village_town: "",
    post_office: "",
    police_station: "",
    district: "",
    state: "",
    pincode: "",
    has_valid_ticket: false,
    ticket_number: "",
    ticket_from: "",
    ticket_to: "",
  });

  const [seizureForm, setSeizureForm] = useState({
    seizure_date: new Date().toISOString().split("T")[0],
    seizure_time: new Date().toTimeString().slice(0, 5),
    seizure_place: "",
    witness1_name: "",
    witness1_address: "",
    witness1_signature: "",
    witness2_name: "",
    witness2_address: "",
    witness2_signature: "",
    seizing_officer_name: profile?.full_name || "",
    seizing_officer_designation: profile?.designation || "",
    seizing_officer_signature: "",
  });

  const [seizedItems, setSeizedItems] = useState<SeizedItem[]>([
    { item_name: "", quantity: 1, unit: "nos", description: "", remarks: "" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, sectionsRes] = await Promise.all([
        supabase.from("railway_posts").select("*"),
        supabase.from("law_sections").select("*"),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
    };
    fetchData();
  }, []);

  const handlePostChange = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setCaseForm({
        ...caseForm,
        railway_zone: post.zone_name,
        post_name: post.post_name,
        jurisdiction: post.court_jurisdiction || "",
        court_name: post.court_name || "",
      });
    }
  };

  const addSeizedItem = () => {
    setSeizedItems([
      ...seizedItems,
      { item_name: "", quantity: 1, unit: "nos", description: "", remarks: "" },
    ]);
  };

  const removeSeizedItem = (index: number) => {
    if (seizedItems.length > 1) {
      setSeizedItems(seizedItems.filter((_, i) => i !== index));
    }
  };

  const handleSeizedItemChange = (
    index: number,
    field: keyof SeizedItem,
    value: string | number,
  ) => {
    const updated = [...seizedItems];
    (updated[index] as any)[field] = value;
    setSeizedItems(updated);
  };

  const handleStep1Submit = async (complete = false) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    if (
      !accusedForm.full_name ||
      !accusedForm.father_name ||
      !accusedForm.age
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill accused name, father name, and age",
        variant: "destructive",
      });
      return;
    }

    if (
      !caseForm.section_of_law ||
      !caseForm.station_name ||
      !caseForm.incident_location
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill section of law, station name, and location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create case
      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          case_number: "",
          railway_zone: caseForm.railway_zone,
          post_name: caseForm.post_name,
          jurisdiction: caseForm.jurisdiction || null,
          section_of_law: caseForm.section_of_law,
          incident_location: caseForm.incident_location,
          platform_number: caseForm.platform_number || null,
          station_name: caseForm.station_name,
          train_number: caseForm.train_number || null,
          train_name: caseForm.train_name || null,
          coach_number: caseForm.coach_number || null,
          raid_start_time: caseForm.raid_start_time || null,
          raid_end_time: caseForm.raid_end_time || null,
          gd_entry_number: caseForm.gd_entry_number || null,
          court_name: caseForm.court_name || null,
          court_production_date: caseForm.court_production_date || null,
          court_production_time: caseForm.court_production_time || null,
          remarks: caseForm.remarks || null,
          created_by: user.id,
          status: "in_progress",
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Create accused
      const { data: newAccused, error: accusedError } = await supabase
        .from("accused")
        .insert({
          case_id: newCase.id,
          full_name: accusedForm.full_name,
          father_name: accusedForm.father_name,
          age: parseInt(accusedForm.age),
          gender: accusedForm.gender,
          mobile_number: accusedForm.mobile_number || null,
          address_line1: accusedForm.address_line1,
          village_town: accusedForm.village_town || null,
          post_office: accusedForm.post_office || null,
          police_station: accusedForm.police_station || null,
          district: accusedForm.district,
          state: accusedForm.state,
          pincode: accusedForm.pincode || null,
          has_valid_ticket: accusedForm.has_valid_ticket,
          ticket_number: accusedForm.ticket_number || null,
          ticket_from: accusedForm.ticket_from || null,
          ticket_to: accusedForm.ticket_to || null,
        })
        .select()
        .single();

      if (accusedError) throw accusedError;

      // Create seizure memo
      const { data: seizureMemo, error: seizureError } = await supabase
        .from("seizure_memos")
        .insert({
          case_id: newCase.id,
          accused_id: newAccused.id,
          seizure_date: seizureForm.seizure_date,
          seizure_time: seizureForm.seizure_time,
          seizure_place:
            seizureForm.seizure_place || caseForm.incident_location,
          witness1_name: seizureForm.witness1_name,
          witness1_address: seizureForm.witness1_address,
          witness1_signature: seizureForm.witness1_signature || null,
          witness2_name: seizureForm.witness2_name,
          witness2_address: seizureForm.witness2_address,
          witness2_signature: seizureForm.witness2_signature || null,
          seizing_officer_name: seizureForm.seizing_officer_name,
          seizing_officer_designation: seizureForm.seizing_officer_designation,
          seizing_officer_signature:
            seizureForm.seizing_officer_signature || null,
          is_completed: complete,
        })
        .select()
        .single();

      if (seizureError) throw seizureError;

      // Insert seized items
      const itemsToInsert = seizedItems
        .filter((item) => item.item_name.trim())
        .map((item) => ({
          seizure_memo_id: seizureMemo.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description || null,
          remarks: item.remarks || null,
        }));

      if (itemsToInsert.length > 0) {
        await supabase.from("seized_items").insert(itemsToInsert);
      }

      // Add officer to case
      await supabase.from("case_officers").insert({
        case_id: newCase.id,
        officer_id: user.id,
        officer_name: profile?.full_name || "Unknown",
        designation: profile?.designation || "Officer",
        role_in_case: "Registering Officer",
      });

      setCreatedCaseId(newCase.id);
      setCreatedAccusedId(newAccused.id);
      setCaseData(newCase);
      setAccusedData(newAccused);
      setAccusedList([newAccused]);

      if (complete) {
        setCompletedSteps([1]);
        setCurrentStep(2);
      }

      toast({
        title: complete ? "Seizure Memo Completed" : "Draft Saved",
        description: complete
          ? "Proceeding to Arrest Memo..."
          : "Case and seizure data saved",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = () => {
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Case Complete",
        description: "All steps completed! Redirecting...",
      });
      router.push(`/cases/${createdCaseId}`);
    }
  };

  const stepsWithCompletion = steps.map((step) => ({
    ...step,
    completed: completedSteps.includes(step.id),
  }));

  const canNavigateToStep = (stepId: number) => {
    if (stepId === 1) return true;
    return !!createdCaseId; // Steps 2-6 need case created first
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cases")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Register New Case</h1>
            <p className="text-muted-foreground">
              Complete all 6 steps to register the case
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <StepIndicator
            steps={stepsWithCompletion}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (canNavigateToStep(step)) setCurrentStep(step);
            }}
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>
            Step {currentStep} of 6 —{" "}
            {currentStep === 1
              ? "Register case, accused & seizure details"
              : "Complete all mandatory fields"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* STEP 1: Seizure Memo (with case + accused) */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Case Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  Case Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Railway Post *</Label>
                    <Select onValueChange={handlePostChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post" />
                      </SelectTrigger>
                      <SelectContent>
                        {posts.map((post) => (
                          <SelectItem key={post.id} value={post.id}>
                            {post.post_name} - {post.zone_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Section of Law *</Label>
                    <Select
                      value={caseForm.section_of_law}
                      onValueChange={(v) =>
                        setCaseForm({ ...caseForm, section_of_law: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.section_code}>
                            {s.section_code} - {s.act_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Station Name *</Label>
                    <Input
                      value={caseForm.station_name}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          station_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Howrah"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Location *</Label>
                    <Input
                      value={caseForm.incident_location}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          incident_location: e.target.value,
                        })
                      }
                      placeholder="e.g., Platform 10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Train Number</Label>
                    <Input
                      value={caseForm.train_number}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          train_number: e.target.value,
                        })
                      }
                      placeholder="e.g., 12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Train Name</Label>
                    <Input
                      value={caseForm.train_name}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          train_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Rajdhani Express"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coach Number</Label>
                    <Input
                      value={caseForm.coach_number}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          coach_number: e.target.value,
                        })
                      }
                      placeholder="e.g., ER-128121"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Raid Start Time</Label>
                    <Input
                      type="time"
                      value={caseForm.raid_start_time}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          raid_start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Raid End Time</Label>
                    <Input
                      type="time"
                      value={caseForm.raid_end_time}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          raid_end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GD Entry Number</Label>
                    <Input
                      value={caseForm.gd_entry_number}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          gd_entry_number: e.target.value,
                        })
                      }
                      placeholder="e.g., 123/2025"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Court Name</Label>
                    <Input
                      value={caseForm.court_name}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          court_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Ld. RJM/Howrah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Court Production Date</Label>
                    <Input
                      type="date"
                      value={caseForm.court_production_date}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          court_production_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Court Production Time</Label>
                    <Input
                      type="time"
                      value={caseForm.court_production_time}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          court_production_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Seizure Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  Seizure Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Seizure *</Label>
                    <Input
                      type="date"
                      value={seizureForm.seizure_date}
                      onChange={(e) =>
                        setSeizureForm({
                          ...seizureForm,
                          seizure_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time of Seizure *</Label>
                    <Input
                      type="time"
                      value={seizureForm.seizure_time}
                      onChange={(e) =>
                        setSeizureForm({
                          ...seizureForm,
                          seizure_time: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Place of Seizure *</Label>
                    <Input
                      value={seizureForm.seizure_place}
                      onChange={(e) =>
                        setSeizureForm({
                          ...seizureForm,
                          seizure_place: e.target.value,
                        })
                      }
                      placeholder="Location of seizure"
                      required
                    />
                  </div>
                </div>

                {/* Seized Articles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Seized Articles
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSeizedItem}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                  {seizedItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 border rounded-lg"
                    >
                      <div className="md:col-span-2 space-y-2">
                        <Label>Item Name *</Label>
                        <Input
                          value={item.item_name}
                          onChange={(e) =>
                            handleSeizedItemChange(
                              index,
                              "item_name",
                              e.target.value,
                            )
                          }
                          placeholder="Article name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleSeizedItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) =>
                            handleSeizedItemChange(
                              index,
                              "unit",
                              e.target.value,
                            )
                          }
                          placeholder="nos/kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Remarks</Label>
                        <Input
                          value={item.remarks}
                          onChange={(e) =>
                            handleSeizedItemChange(
                              index,
                              "remarks",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        {seizedItems.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeSeizedItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accused / Person Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  Person from Whom Seizure Made
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={accusedForm.full_name}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          full_name: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Father&apos;s Name *</Label>
                    <Input
                      value={accusedForm.father_name}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          father_name: e.target.value,
                        })
                      }
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      value={accusedForm.age}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          age: e.target.value,
                        })
                      }
                      placeholder="e.g., 25"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={accusedForm.gender}
                      onValueChange={(v: any) =>
                        setAccusedForm({ ...accusedForm, gender: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input
                      value={accusedForm.mobile_number}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          mobile_number: e.target.value,
                        })
                      }
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      value={accusedForm.pincode}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          pincode: e.target.value,
                        })
                      }
                      placeholder="e.g., 700001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input
                    value={accusedForm.address_line1}
                    onChange={(e) =>
                      setAccusedForm({
                        ...accusedForm,
                        address_line1: e.target.value,
                      })
                    }
                    placeholder="Street address / Village"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Village/Town</Label>
                    <Input
                      value={accusedForm.village_town}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          village_town: e.target.value,
                        })
                      }
                      placeholder="Village or town"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Post Office</Label>
                    <Input
                      value={accusedForm.post_office}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          post_office: e.target.value,
                        })
                      }
                      placeholder="Post office name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Police Station</Label>
                    <Input
                      value={accusedForm.police_station}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          police_station: e.target.value,
                        })
                      }
                      placeholder="Police station"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Input
                      value={accusedForm.district}
                      onChange={(e) =>
                        setAccusedForm({
                          ...accusedForm,
                          district: e.target.value,
                        })
                      }
                      placeholder="District name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={accusedForm.state}
                      onValueChange={(v) =>
                        setAccusedForm({ ...accusedForm, state: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Witnesses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  Witnesses
                </h3>
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="text-sm font-semibold">Witness 1</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={seizureForm.witness1_name}
                        onChange={(e) =>
                          setSeizureForm({
                            ...seizureForm,
                            witness1_name: e.target.value,
                          })
                        }
                        placeholder="Witness name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Input
                        value={seizureForm.witness1_address}
                        onChange={(e) =>
                          setSeizureForm({
                            ...seizureForm,
                            witness1_address: e.target.value,
                          })
                        }
                        placeholder="Witness address"
                        required
                      />
                    </div>
                  </div>
                  <SignaturePad
                    label="Witness 1 Signature"
                    value={seizureForm.witness1_signature}
                    onChange={(sig) =>
                      setSeizureForm({
                        ...seizureForm,
                        witness1_signature: sig,
                      })
                    }
                  />
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label className="text-sm font-semibold">Witness 2</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={seizureForm.witness2_name}
                        onChange={(e) =>
                          setSeizureForm({
                            ...seizureForm,
                            witness2_name: e.target.value,
                          })
                        }
                        placeholder="Witness name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Input
                        value={seizureForm.witness2_address}
                        onChange={(e) =>
                          setSeizureForm({
                            ...seizureForm,
                            witness2_address: e.target.value,
                          })
                        }
                        placeholder="Witness address"
                        required
                      />
                    </div>
                  </div>
                  <SignaturePad
                    label="Witness 2 Signature"
                    value={seizureForm.witness2_signature}
                    onChange={(sig) =>
                      setSeizureForm({
                        ...seizureForm,
                        witness2_signature: sig,
                      })
                    }
                  />
                </div>
              </div>

              {/* Seizing Officer */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  Seizing Officer
                </h3>
                <div className="space-y-2">
                  <Label>Select Officer *</Label>
                  <OfficerCombobox
                    value={undefined}
                    onChange={(id, officer) => {
                      if (officer) {
                        setSeizureForm({
                          ...seizureForm,
                          seizing_officer_name: officer.full_name,
                          seizing_officer_designation: officer.designation,
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
                      value={seizureForm.seizing_officer_name}
                      onChange={(e) =>
                        setSeizureForm({
                          ...seizureForm,
                          seizing_officer_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation *</Label>
                    <Input
                      value={seizureForm.seizing_officer_designation}
                      onChange={(e) =>
                        setSeizureForm({
                          ...seizureForm,
                          seizing_officer_designation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <SignaturePad
                  label="Officer Signature"
                  value={seizureForm.seizing_officer_signature}
                  onChange={(sig) =>
                    setSeizureForm({
                      ...seizureForm,
                      seizing_officer_signature: sig,
                    })
                  }
                  required
                />
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  value={caseForm.remarks}
                  onChange={(e) =>
                    setCaseForm({ ...caseForm, remarks: e.target.value })
                  }
                  placeholder="Any additional remarks..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStep1Submit(false)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" /> Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleStep1Submit(true)}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete & Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Arrest Memo */}
          {currentStep === 2 && createdCaseId && createdAccusedId && (
            <ArrestMemoForm
              caseId={createdCaseId}
              accusedId={createdAccusedId}
              caseData={caseData}
              accused={accusedData}
              onComplete={handleStepComplete}
            />
          )}

          {/* STEP 3: Personal Search */}
          {currentStep === 3 && createdCaseId && createdAccusedId && (
            <PersonalSearchForm
              caseId={createdCaseId}
              accusedId={createdAccusedId}
              caseData={caseData}
              accused={accusedData}
              onComplete={handleStepComplete}
            />
          )}

          {/* STEP 4: Medical Certificate */}
          {currentStep === 4 && createdCaseId && createdAccusedId && (
            <MedicalMemoForm
              caseId={createdCaseId}
              accusedId={createdAccusedId}
              caseData={caseData}
              accused={accusedData}
              onComplete={handleStepComplete}
            />
          )}

          {/* STEP 5: BNSS Checklist */}
          {currentStep === 5 && createdCaseId && createdAccusedId && (
            <BNSSChecklistForm
              caseId={createdCaseId}
              accusedId={createdAccusedId}
              caseData={caseData}
              accused={accusedData}
              onComplete={handleStepComplete}
            />
          )}

          {/* STEP 6: Accused Challan */}
          {currentStep === 6 && createdCaseId && (
            <AccusedChallanForm
              caseId={createdCaseId}
              caseData={caseData}
              accusedList={accusedList}
              onComplete={handleStepComplete}
            />
          )}

          {/* Show message if trying to access steps 2-6 before step 1 */}
          {currentStep > 1 && !createdCaseId && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Please complete Step 1 (Seizure Memo) first to register the
                case.
              </p>
              <Button className="mt-4" onClick={() => setCurrentStep(1)}>
                Go to Step 1
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {createdCaseId && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            disabled={currentStep === 6}
          >
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewCase;
