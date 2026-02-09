import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/integrations/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SignaturePad from '@/components/SignaturePad';
import OfficerCombobox from '@/components/ui/OfficerCombobox';
import { Loader2, Plus, Trash2, Save, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSeizureMemoPDF } from '@/lib/pdfGenerator';

interface SeizureMemoFormProps {
  caseId: string;
  accusedId: string;
  caseData: any;
  accused: any;
  onComplete: () => void;
}

interface SeizedItem {
  item_name: string;
  quantity: number;
  unit: string;
  description: string;
  remarks: string;
}

const SeizureMemoForm: React.FC<SeizureMemoFormProps> = ({
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
    seizure_date: new Date().toISOString().split('T')[0],
    seizure_time: new Date().toTimeString().slice(0, 5),
    seizure_place: caseData.incident_location || '',
    witness1_name: '',
    witness1_address: '',
    witness1_signature: '',
    witness2_name: '',
    witness2_address: '',
    witness2_signature: '',
    seizing_officer_name: profile?.full_name || '',
    seizing_officer_designation: profile?.designation || '',
    seizing_officer_signature: '',
  });

  const [seizedItems, setSeizedItems] = useState<SeizedItem[]>([
    { item_name: '', quantity: 1, unit: 'nos', description: '', remarks: '' },
  ]);

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('seizure_memos')
        .select('*')
        .eq('case_id', caseId)
        .eq('accused_id', accusedId)
        .single();

      if (data) {
        setExistingMemo(data);
        setFormData({
          seizure_date: data.seizure_date,
          seizure_time: data.seizure_time,
          seizure_place: data.seizure_place,
          witness1_name: data.witness1_name,
          witness1_address: data.witness1_address,
          witness1_signature: data.witness1_signature || '',
          witness2_name: data.witness2_name,
          witness2_address: data.witness2_address,
          witness2_signature: data.witness2_signature || '',
          seizing_officer_name: data.seizing_officer_name,
          seizing_officer_designation: data.seizing_officer_designation,
          seizing_officer_signature: data.seizing_officer_signature || '',
        });

        // Fetch seized items
        const { data: items } = await supabase
          .from('seized_items')
          .select('*')
          .eq('seizure_memo_id', data.id);

        if (items && items.length > 0) {
          setSeizedItems(
            items.map((item) => ({
              item_name: item.item_name,
              quantity: item.quantity,
              unit: item.unit || 'nos',
              description: item.description || '',
              remarks: item.remarks || '',
            }))
          );
        }
      }
    };
    fetchExisting();
  }, [caseId, accusedId]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof SeizedItem, value: string | number) => {
    const updated = [...seizedItems];
    (updated[index] as any)[field] = value;
    setSeizedItems(updated);
  };

  const addItem = () => {
    setSeizedItems([
      ...seizedItems,
      { item_name: '', quantity: 1, unit: 'nos', description: '', remarks: '' },
    ]);
  };

  const removeItem = (index: number) => {
    if (seizedItems.length > 1) {
      setSeizedItems(seizedItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const memoData = {
        case_id: caseId,
        accused_id: accusedId,
        seizure_date: formData.seizure_date,
        seizure_time: formData.seizure_time,
        seizure_place: formData.seizure_place,
        witness1_name: formData.witness1_name,
        witness1_address: formData.witness1_address,
        witness1_signature: formData.witness1_signature || null,
        witness2_name: formData.witness2_name,
        witness2_address: formData.witness2_address,
        witness2_signature: formData.witness2_signature || null,
        seizing_officer_name: formData.seizing_officer_name,
        seizing_officer_designation: formData.seizing_officer_designation,
        seizing_officer_signature: formData.seizing_officer_signature || null,
        is_completed: complete,
      };

      let memoId: string;

      if (existingMemo) {
        const { error } = await supabase
          .from('seizure_memos')
          .update(memoData)
          .eq('id', existingMemo.id);

        if (error) throw error;
        memoId = existingMemo.id;

        // Delete old items and insert new ones
        await supabase.from('seized_items').delete().eq('seizure_memo_id', memoId);
      } else {
        const { data, error } = await supabase
          .from('seizure_memos')
          .insert(memoData)
          .select()
          .single();

        if (error) throw error;
        memoId = data.id;
      }

      // Insert seized items
      const itemsToInsert = seizedItems
        .filter((item) => item.item_name.trim())
        .map((item) => ({
          seizure_memo_id: memoId,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description || null,
          remarks: item.remarks || null,
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemError } = await supabase.from('seized_items').insert(itemsToInsert);
        if (itemError) throw itemError;
      }

      // Update case status if first memo
      await supabase.from('cases').update({ status: 'in_progress' }).eq('id', caseId);

      toast({
        title: complete ? 'Seizure Memo Completed' : 'Seizure Memo Saved',
        description: complete ? 'Proceeding to next step...' : 'Draft saved successfully',
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving seizure memo:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save seizure memo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateSeizureMemoPDF({
      ...formData,
      caseData,
      accused,
      seizedItems,
    });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seizure_date">Date of Seizure *</Label>
          <Input
            id="seizure_date"
            type="date"
            value={formData.seizure_date}
            onChange={(e) => handleChange('seizure_date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seizure_time">Time of Seizure *</Label>
          <Input
            id="seizure_time"
            type="time"
            value={formData.seizure_time}
            onChange={(e) => handleChange('seizure_time', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seizure_place">Place of Seizure *</Label>
          <Input
            id="seizure_place"
            value={formData.seizure_place}
            onChange={(e) => handleChange('seizure_place', e.target.value)}
            placeholder="Location of seizure"
            required
          />
        </div>
      </div>

      {/* Seized Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Seized Articles</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        {seizedItems.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 border rounded-lg">
            <div className="md:col-span-2 space-y-2">
              <Label>Item Name *</Label>
              <Input
                value={item.item_name}
                onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                placeholder="Article name"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={item.unit}
                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                placeholder="nos/kg/etc"
              />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input
                value={item.remarks}
                onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                placeholder="Any remarks"
              />
            </div>
            <div className="flex items-end">
              {seizedItems.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Witness 1 */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Witness 1</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.witness1_name}
              onChange={(e) => handleChange('witness1_name', e.target.value)}
              placeholder="Witness name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={formData.witness1_address}
              onChange={(e) => handleChange('witness1_address', e.target.value)}
              placeholder="Witness address"
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Witness 1 Signature"
          value={formData.witness1_signature}
          onChange={(sig) => handleChange('witness1_signature', sig)}
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
              onChange={(e) => handleChange('witness2_name', e.target.value)}
              placeholder="Witness name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={formData.witness2_address}
              onChange={(e) => handleChange('witness2_address', e.target.value)}
              placeholder="Witness address"
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Witness 2 Signature"
          value={formData.witness2_signature}
          onChange={(sig) => handleChange('witness2_signature', sig)}
        />
      </div>

      {/* Seizing Officer */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Seizing Officer</Label>
        <div className="space-y-2">
          <Label>Select Officer *</Label>
          <OfficerCombobox
            value={undefined}
            onChange={(id, officer) => {
              if (officer) {
                setFormData({
                  ...formData,
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
              value={formData.seizing_officer_name}
              onChange={(e) => handleChange('seizing_officer_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Designation *</Label>
            <Input
              value={formData.seizing_officer_designation}
              onChange={(e) => handleChange('seizing_officer_designation', e.target.value)}
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Officer Signature"
          value={formData.seizing_officer_signature}
          onChange={(sig) => handleChange('seizing_officer_signature', sig)}
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

export default SeizureMemoForm;
