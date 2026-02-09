import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/integrations/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SignaturePad from '@/components/SignaturePad';
import { Loader2, Save, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMedicalMemoPDF } from '@/lib/pdfGenerator';

interface MedicalMemoFormProps {
  caseId: string;
  accusedId: string;
  caseData: any;
  accused: any;
  onComplete: () => void;
}

const MedicalMemoForm: React.FC<MedicalMemoFormProps> = ({
  caseId,
  accusedId,
  caseData,
  accused,
  onComplete,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingMemo, setExistingMemo] = useState<any>(null);

  const [formData, setFormData] = useState({
    examination_date: new Date().toISOString().split('T')[0],
    examination_time: new Date().toTimeString().slice(0, 5),
    hospital_name: 'DRM Health Unit',
    medical_officer_name: '',
    has_injuries: false,
    injury_description: '',
    fitness_status: 'fit',
    doctor_signature: '',
    remarks: '',
  });

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('medical_memos')
        .select('*')
        .eq('case_id', caseId)
        .eq('accused_id', accusedId)
        .single();

      if (data) {
        setExistingMemo(data);
        setFormData({
          examination_date: data.examination_date,
          examination_time: data.examination_time,
          hospital_name: data.hospital_name,
          medical_officer_name: data.medical_officer_name,
          has_injuries: data.has_injuries || false,
          injury_description: data.injury_description || '',
          fitness_status: data.fitness_status,
          doctor_signature: data.doctor_signature || '',
          remarks: data.remarks || '',
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
        examination_date: formData.examination_date,
        examination_time: formData.examination_time,
        hospital_name: formData.hospital_name,
        medical_officer_name: formData.medical_officer_name,
        has_injuries: formData.has_injuries,
        injury_description: formData.injury_description || null,
        fitness_status: formData.fitness_status,
        doctor_signature: formData.doctor_signature || null,
        remarks: formData.remarks || null,
        is_completed: complete,
      };

      if (existingMemo) {
        const { error } = await supabase
          .from('medical_memos')
          .update(memoData)
          .eq('id', existingMemo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medical_memos').insert(memoData);
        if (error) throw error;
      }

      toast({
        title: complete ? 'Medical Memo Completed' : 'Medical Memo Saved',
        description: complete ? 'Proceeding to next step...' : 'Draft saved successfully',
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving medical memo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save medical memo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateMedicalMemoPDF({ ...formData, caseData, accused });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Examination Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="examination_date">Date of Examination *</Label>
          <Input
            id="examination_date"
            type="date"
            value={formData.examination_date}
            onChange={(e) => handleChange('examination_date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examination_time">Time of Examination *</Label>
          <Input
            id="examination_time"
            type="time"
            value={formData.examination_time}
            onChange={(e) => handleChange('examination_time', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hospital_name">Hospital/Medical Unit *</Label>
          <Input
            id="hospital_name"
            value={formData.hospital_name}
            onChange={(e) => handleChange('hospital_name', e.target.value)}
            placeholder="e.g., DRM Health Unit"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medical_officer_name">Medical Officer Name *</Label>
          <Input
            id="medical_officer_name"
            value={formData.medical_officer_name}
            onChange={(e) => handleChange('medical_officer_name', e.target.value)}
            placeholder="Name of examining doctor"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fitness_status">Fitness Status *</Label>
          <Select
            value={formData.fitness_status}
            onValueChange={(v) => handleChange('fitness_status', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit for Custody</SelectItem>
              <SelectItem value="unfit">Unfit for Custody</SelectItem>
              <SelectItem value="requires_treatment">Requires Treatment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Injury Details */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_injuries"
            checked={formData.has_injuries}
            onCheckedChange={(checked) => handleChange('has_injuries', checked as boolean)}
          />
          <Label htmlFor="has_injuries">Visible injuries observed</Label>
        </div>
        {formData.has_injuries && (
          <div className="space-y-2">
            <Label htmlFor="injury_description">Injury Description</Label>
            <Textarea
              id="injury_description"
              value={formData.injury_description}
              onChange={(e) => handleChange('injury_description', e.target.value)}
              placeholder="Describe nature and extent of injuries..."
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Medical Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          placeholder="Any additional medical observations..."
          rows={3}
        />
      </div>

      {/* Doctor Signature */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Medical Officer Signature</Label>
        <SignaturePad
          label="Doctor's Signature"
          value={formData.doctor_signature}
          onChange={(sig) => handleChange('doctor_signature', sig)}
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
        <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete & Next
        </Button>
      </div>
    </form>
  );
};

export default MedicalMemoForm;
