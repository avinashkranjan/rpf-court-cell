import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import StepIndicator from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  FileText,
  User,
  Loader2,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SeizureMemoForm from '@/components/forms/SeizureMemoForm';
import ArrestMemoForm from '@/components/forms/ArrestMemoForm';
import PersonalSearchForm from '@/components/forms/PersonalSearchForm';
import MedicalMemoForm from '@/components/forms/MedicalMemoForm';
import BNSSChecklistForm from '@/components/forms/BNSSChecklistForm';
import CourtForwardingForm from '@/components/forms/CourtForwardingForm';
import AccusedChallanForm from '@/components/forms/AccusedChallanForm';

interface CaseData {
  id: string;
  case_number: string;
  case_date: string;
  railway_zone: string;
  post_name: string;
  jurisdiction: string | null;
  section_of_law: string;
  incident_location: string;
  platform_number: string | null;
  station_name: string;
  train_number: string | null;
  train_name: string | null;
  coach_number: string | null;
  raid_start_time: string | null;
  raid_end_time: string | null;
  gd_entry_number: string | null;
  status: string;
  court_name: string | null;
  court_production_date: string | null;
  court_production_time: string | null;
  remarks: string | null;
  created_at: string;
}

interface Accused {
  id: string;
  full_name: string;
  father_name: string;
  age: number;
  gender: string;
  mobile_number: string | null;
  address_line1: string;
  village_town: string | null;
  post_office: string | null;
  police_station: string | null;
  district: string;
  state: string;
  pincode: string | null;
}

const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [accusedList, setAccusedList] = useState<Accused[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccusedId, setSelectedAccusedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  const steps = [
    { id: 1, name: 'Seizure Memo', shortName: 'Seizure' },
    { id: 2, name: 'Arrest Memo', shortName: 'Arrest' },
    { id: 3, name: 'Personal Search', shortName: 'Search' },
    { id: 4, name: 'Medical Memo', shortName: 'Medical' },
    { id: 5, name: 'BNSS Checklist', shortName: 'Checklist' },
    { id: 6, name: 'Court Forwarding', shortName: 'Court' },
    { id: 7, name: 'Accused Challan', shortName: 'Challan' },
  ];

  useEffect(() => {
    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const [caseRes, accusedRes] = await Promise.all([
        supabase.from('cases').select('*').eq('id', id).single(),
        supabase.from('accused').select('*').eq('case_id', id),
      ]);

      if (caseRes.error) throw caseRes.error;
      setCaseData(caseRes.data);
      setAccusedList(accusedRes.data || []);

      if (accusedRes.data && accusedRes.data.length > 0) {
        setSelectedAccusedId(accusedRes.data[0].id);
        await fetchCompletedSteps(accusedRes.data);
      }
    } catch (error: any) {
      console.error('Error fetching case:', error);
      toast({
        title: 'Error',
        description: 'Failed to load case details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedSteps = async (accused: Accused[]) => {
    const stepsCompleted: Record<string, number[]> = {};

    for (const acc of accused) {
      const completed: number[] = [];

      const [seizure, arrest, search, medical, checklist, forwarding] = await Promise.all([
        supabase.from('seizure_memos').select('is_completed').eq('accused_id', acc.id).single(),
        supabase.from('arrest_memos').select('is_completed').eq('accused_id', acc.id).single(),
        supabase.from('personal_search_memos').select('is_completed').eq('accused_id', acc.id).single(),
        supabase.from('medical_memos').select('is_completed').eq('accused_id', acc.id).single(),
        supabase.from('bnss_checklists').select('is_completed').eq('accused_id', acc.id).single(),
        supabase.from('court_forwardings').select('is_completed').eq('accused_id', acc.id).single(),
      ]);

      if (seizure.data?.is_completed) completed.push(1);
      if (arrest.data?.is_completed) completed.push(2);
      if (search.data?.is_completed) completed.push(3);
      if (medical.data?.is_completed) completed.push(4);
      if (checklist.data?.is_completed) completed.push(5);
      if (forwarding.data?.is_completed) completed.push(6);

      stepsCompleted[acc.id] = completed;
    }

    // Check challan completion (case-level)
    const challanRes = await supabase
      .from('accused_challans')
      .select('is_completed')
      .eq('case_id', id)
      .single();

    if (challanRes.data?.is_completed) {
      // Add step 7 to all accused
      for (const key of Object.keys(stepsCompleted)) {
        stepsCompleted[key].push(7);
      }
    }

    setCompletedSteps(stepsCompleted);
  };

  const handleStepComplete = async () => {
    await fetchCaseData();
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      in_progress: 'bg-primary text-primary-foreground',
      pending_approval: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
      approved: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
      forwarded_to_court: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
      closed: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge className={colors[status] || ''}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Case Not Found</h2>
          <Button onClick={() => navigate('/cases')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </AppLayout>
    );
  }

  const stepsWithCompletion = steps.map((step) => ({
    ...step,
    completed: selectedAccusedId
      ? completedSteps[selectedAccusedId]?.includes(step.id) || false
      : false,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/cases')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{caseData.case_number}</h1>
                <p className="text-muted-foreground">
                  {caseData.section_of_law} | {caseData.station_name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(caseData.status)}
          </div>
        </div>

        {/* Case Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{new Date(caseData.case_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Railway Zone:</span>
                <p className="font-medium">{caseData.railway_zone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Post:</span>
                <p className="font-medium">{caseData.post_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p className="font-medium">{caseData.incident_location}</p>
              </div>
              {caseData.train_number && (
                <div>
                  <span className="text-muted-foreground">Train:</span>
                  <p className="font-medium">
                    {caseData.train_number} {caseData.train_name && `(${caseData.train_name})`}
                  </p>
                </div>
              )}
              {caseData.coach_number && (
                <div>
                  <span className="text-muted-foreground">Coach:</span>
                  <p className="font-medium">{caseData.coach_number}</p>
                </div>
              )}
              {caseData.court_name && (
                <div>
                  <span className="text-muted-foreground">Court:</span>
                  <p className="font-medium">{caseData.court_name}</p>
                </div>
              )}
              {caseData.court_production_date && (
                <div>
                  <span className="text-muted-foreground">Production Date:</span>
                  <p className="font-medium">
                    {new Date(caseData.court_production_date).toLocaleDateString()}
                    {caseData.court_production_time && ` at ${caseData.court_production_time}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accused Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Accused Persons ({accusedList.length})
            </CardTitle>
            <CardDescription>
              Select an accused to complete their documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {accusedList.map((accused) => {
                const allStepsComplete = completedSteps[accused.id]?.length === 6;
                return (
                  <Button
                    key={accused.id}
                    variant={selectedAccusedId === accused.id ? 'default' : 'outline'}
                    onClick={() => setSelectedAccusedId(accused.id)}
                    className="relative"
                  >
                    {accused.full_name}
                    {allStepsComplete && (
                      <span className="ml-2 text-xs bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedAccusedId && (
          <>
            {/* Step Indicator */}
            <Card>
              <CardContent className="pt-6">
                <StepIndicator
                  steps={stepsWithCompletion}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </CardContent>
            </Card>

            {/* Step Forms */}
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].name}</CardTitle>
                <CardDescription>
                  Step {currentStep} of 7 - Complete all mandatory fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <SeizureMemoForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 2 && (
                  <ArrestMemoForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 3 && (
                  <PersonalSearchForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 4 && (
                  <MedicalMemoForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 5 && (
                  <BNSSChecklistForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 6 && (
                  <CourtForwardingForm
                    caseId={id!}
                    accusedId={selectedAccusedId}
                    caseData={caseData}
                    accused={accusedList.find((a) => a.id === selectedAccusedId)!}
                    onComplete={handleStepComplete}
                  />
                )}
                {currentStep === 7 && (
                  <AccusedChallanForm
                    caseId={id!}
                    caseData={caseData}
                    accusedList={accusedList}
                    onComplete={handleStepComplete}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous Step
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                disabled={currentStep === 7}
              >
                Next Step
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default CaseDetails;
