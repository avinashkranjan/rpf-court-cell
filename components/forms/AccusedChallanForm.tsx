import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAccusedChallanPDF } from '@/lib/pdfGenerator';

interface AccusedChallanFormProps {
  caseId: string;
  caseData: any;
  accusedList: any[];
  onComplete: () => void;
}

const AccusedChallanForm: React.FC<AccusedChallanFormProps> = ({
  caseId,
  caseData,
  accusedList,
  onComplete,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingChallan, setExistingChallan] = useState<any>(null);
  const [accusedStatus, setAccusedStatus] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    challan_date: new Date().toISOString().split('T')[0],
    court_name: caseData.court_name || 'Ld. RJM/HOWRAH',
    escorting_officers: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch existing challan
      const { data: challan } = await supabase
        .from('accused_challans')
        .select('*')
        .eq('case_id', caseId)
        .single();

      if (challan) {
        setExistingChallan(challan);
        setFormData({
          challan_date: challan.challan_date,
          court_name: challan.court_name,
          escorting_officers: challan.escorting_officers || '',
        });
      }

      // Check completion status for each accused
      const status: Record<string, boolean> = {};
      for (const accused of accusedList) {
        const [seizure, arrest, search, medical, checklist, forwarding] = await Promise.all([
          supabase.from('seizure_memos').select('is_completed').eq('accused_id', accused.id).single(),
          supabase.from('arrest_memos').select('is_completed').eq('accused_id', accused.id).single(),
          supabase.from('personal_search_memos').select('is_completed').eq('accused_id', accused.id).single(),
          supabase.from('medical_memos').select('is_completed').eq('accused_id', accused.id).single(),
          supabase.from('bnss_checklists').select('is_completed').eq('accused_id', accused.id).single(),
          supabase.from('court_forwardings').select('is_completed').eq('accused_id', accused.id).single(),
        ]);

        status[accused.id] = 
          seizure.data?.is_completed &&
          arrest.data?.is_completed &&
          search.data?.is_completed &&
          medical.data?.is_completed &&
          checklist.data?.is_completed &&
          forwarding.data?.is_completed;
      }
      setAccusedStatus(status);
    };
    fetchData();
  }, [caseId, accusedList]);

  const allAccusedComplete = Object.values(accusedStatus).every(Boolean);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();

    if (complete && !allAccusedComplete) {
      toast({
        title: 'Cannot Complete Challan',
        description: 'All accused must have all 6 steps completed before generating challan',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const enclosures = [
        { name: 'Court Forwarding', count: accusedList.length },
        { name: 'Arrest-cum-Insp. Memo', count: accusedList.length },
        { name: 'Personal Search', count: accusedList.length },
        { name: 'BNSS Check List', count: accusedList.length },
        { name: 'Medical Memo', count: accusedList.length },
      ];

      const challanData = {
        case_id: caseId,
        challan_date: formData.challan_date,
        court_name: formData.court_name,
        escorting_officers: formData.escorting_officers || null,
        enclosures: enclosures,
        is_completed: complete,
      };

      if (existingChallan) {
        const { error } = await supabase
          .from('accused_challans')
          .update(challanData)
          .eq('id', existingChallan.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('accused_challans')
          .insert(challanData)
          .select()
          .single();

        if (error) throw error;

        // Insert challan_accused entries
        const challanAccused = accusedList.map((accused, index) => ({
          challan_id: data.id,
          accused_id: accused.id,
          sl_number: index + 1,
        }));

        const { error: linkError } = await supabase.from('challan_accused').insert(challanAccused);
        if (linkError) throw linkError;
      }

      // Update case status
      if (complete) {
        await supabase.from('cases').update({ status: 'approved' }).eq('id', caseId);
      }

      toast({
        title: complete ? 'Challan Generated Successfully!' : 'Challan Saved',
        description: complete ? 'All documents are ready for court submission' : 'Draft saved successfully',
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving challan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save challan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateAccusedChallanPDF({ ...formData, caseData, accusedList });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm font-semibold">IN THE COURT OF {formData.court_name}</p>
        <p className="text-lg font-bold mt-2">ACCUSED CHALLAN</p>
        <p className="text-sm">{caseData.post_name}</p>
        <p className="text-sm">DATED-: {new Date(formData.challan_date).toLocaleDateString()}</p>
      </div>

      {/* Completion Status */}
      {!allAccusedComplete && (
        <div className="p-4 border-l-4 border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[hsl(var(--warning))]" />
            <p className="font-medium">Incomplete Documentation</p>
          </div>
          <p className="text-sm mt-1 text-muted-foreground">
            Some accused persons have incomplete documentation. Complete all 6 steps for each accused before generating the final challan.
          </p>
        </div>
      )}

      {/* Accused List */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Accused Persons</Label>
        {accusedList.map((accused, index) => (
          <Card key={accused.id} className={accusedStatus[accused.id] ? 'border-[hsl(var(--success))]' : 'border-destructive'}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="font-bold">#{index + 1}</span>
                  {accused.full_name}
                </CardTitle>
                <Badge variant={accusedStatus[accused.id] ? 'default' : 'destructive'} className={accusedStatus[accused.id] ? 'bg-[hsl(var(--success))]' : ''}>
                  {accusedStatus[accused.id] ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </>
                  ) : (
                    'Incomplete'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-2 text-sm">
              <p className="text-muted-foreground">
                {accused.gender}-{accused.age} Yrs, S/O- {accused.father_name} of {accused.address_line1}, Dist- {accused.district}, {accused.state}
              </p>
              <p className="mt-1"><strong>Section:</strong> {caseData.section_of_law} Railway Act</p>
              <p className="mt-1"><strong>Mobile:</strong> {accused.mobile_number || 'N/A'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enclosures */}
      <div className="p-4 border rounded-lg">
        <Label className="text-base font-semibold">Enclosures (per accused)</Label>
        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
          <li>Court Forwarding - 01</li>
          <li>Arrest-cum-Inspection Memo - 01</li>
          <li>Personal Search Memo - 01</li>
          <li>BNSS Check List - 01</li>
          <li>Medical Memo - 01</li>
        </ul>
      </div>

      {/* Escorting Officers */}
      <div className="space-y-2">
        <Label htmlFor="escorting_officers">Escorting Officers</Label>
        <Textarea
          id="escorting_officers"
          value={formData.escorting_officers}
          onChange={(e) => handleChange('escorting_officers', e.target.value)}
          placeholder="e.g., SI/ Shyam Das, HC/ B K Singh, HC/ Pintu Bera"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        {existingChallan?.is_completed && (
          <Button type="button" variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Challan PDF
          </Button>
        )}
        <Button type="submit" variant="outline" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading || !allAccusedComplete}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Final Challan
        </Button>
      </div>
    </form>
  );
};

export default AccusedChallanForm;
