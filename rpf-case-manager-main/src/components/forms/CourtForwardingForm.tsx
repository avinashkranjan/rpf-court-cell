import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SignaturePad from '@/components/SignaturePad';
import { Loader2, Save, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCourtForwardingPDF } from '@/lib/pdfGenerator';

interface CourtForwardingFormProps {
  caseId: string;
  accusedId: string;
  caseData: any;
  accused: any;
  onComplete: () => void;
}

const CourtForwardingForm: React.FC<CourtForwardingFormProps> = ({
  caseId,
  accusedId,
  caseData,
  accused,
  onComplete,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingForwarding, setExistingForwarding] = useState<any>(null);

  const getAccusedAddress = () => {
    return `${accused.full_name}, Mob No- ${accused.mobile_number || 'N/A'}, ${accused.gender}-${accused.age} Yrs, S/O- ${accused.father_name} of ${accused.address_line1}, P.O- ${accused.post_office || 'N/A'}, P.S- ${accused.police_station || 'N/A'}, Dist- ${accused.district}(${accused.state})-${accused.pincode || 'N/A'}`;
  };

  const generateNarrative = () => {
    return `In producing herewith the above named arrested person along with relevant papers, viz. personal search memo, arrest memo a/w medical examination report and checklist, I beg to submit that on ${new Date(caseData.case_date).toLocaleDateString()}, I ${profile?.designation}/ ${profile?.full_name} a/w on-duty staff of ${caseData.post_name} conducted a raid against offenders of the Railway Act at ${caseData.station_name} ${caseData.platform_number ? `platform number ${caseData.platform_number}` : ''}, and circulating area starting from ${caseData.raid_start_time || 'morning hours'} onwards.

During this operation, the raiding party observed that the above named person was involved in an offence under section ${caseData.section_of_law} of the Railway Act. ${caseData.train_number ? `The accused was found in Train No- ${caseData.train_number}${caseData.train_name ? ` (${caseData.train_name})` : ''}${caseData.coach_number ? ` Coach No- ${caseData.coach_number}` : ''} at ${caseData.incident_location}.` : `The accused was found at ${caseData.incident_location}.`}

${accused.has_valid_ticket ? `The accused stated that he has a valid Railway Ticket vide no- ${accused.ticket_number || 'N/A'}, Ex- ${accused.ticket_from || 'N/A'} to ${accused.ticket_to || 'N/A'} but was found violating railway rules.` : 'The accused failed to produce any valid ticket or authority for his act.'}

Finding no alternative, he has been taken into custody under the provisions of Section 179(2) Railway Act for committing an offence punishable under section ${caseData.section_of_law} of Railway Act.

Subsequently, he was brought to ${caseData.post_name}, where all legal formalities were observed in accordance with the terms and conditions of the NHRC. A case, vide No. ${caseData.case_number}, dated-${new Date(caseData.case_date).toLocaleDateString()} was registered under Section ${caseData.section_of_law} of the Railways Act. Further, he was sent for medical examination where the on-duty doctor examined him and issued a medical certificate in favour of the arrested accused.

In accordance with the newly enacted BNSS, Section 47, the accused was duly informed of the charges against him. The arrest was made in compliance with Section 35 of the BNSS, as detailed in the attached checklist.`;
  };

  const [formData, setFormData] = useState({
    railway_name: caseData.railway_zone || 'Eastern Railway',
    state_name: 'West Bengal',
    complainant_name: profile?.full_name || '',
    complainant_designation: profile?.designation || '',
    raid_description: generateNarrative(),
    detection_details: '',
    offence_explanation: '',
    ticket_authority_logic: '',
    bail_status: 'The offence is bail-able; consequently, bail was offered, but the accused failed to provide surety.',
    bnss_references: 'Section 35 and Section 47 of BNSS',
    prayer_for_cognizance: `I therefore, pray before your honour to take cognizance of the case under Section ${caseData.section_of_law} of the Railway Act against the aforementioned person.`,
    complainant_signature: '',
    forwarding_officer_name: '',
    forwarding_officer_designation: '',
    forwarding_officer_signature: '',
  });

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('court_forwardings')
        .select('*')
        .eq('case_id', caseId)
        .eq('accused_id', accusedId)
        .single();

      if (data) {
        setExistingForwarding(data);
        setFormData({
          railway_name: data.railway_name,
          state_name: data.state_name,
          complainant_name: data.complainant_name,
          complainant_designation: data.complainant_designation,
          raid_description: data.raid_description,
          detection_details: data.detection_details || '',
          offence_explanation: data.offence_explanation || '',
          ticket_authority_logic: data.ticket_authority_logic || '',
          bail_status: data.bail_status,
          bnss_references: data.bnss_references,
          prayer_for_cognizance: data.prayer_for_cognizance,
          complainant_signature: data.complainant_signature || '',
          forwarding_officer_name: data.forwarding_officer_name || '',
          forwarding_officer_designation: data.forwarding_officer_designation || '',
          forwarding_officer_signature: data.forwarding_officer_signature || '',
        });
      }
    };
    fetchExisting();
  }, [caseId, accusedId]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent, complete = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const forwardingData = {
        case_id: caseId,
        accused_id: accusedId,
        railway_name: formData.railway_name,
        state_name: formData.state_name,
        complainant_name: formData.complainant_name,
        complainant_designation: formData.complainant_designation,
        raid_description: formData.raid_description,
        detection_details: formData.detection_details || '',
        offence_explanation: formData.offence_explanation || '',
        ticket_authority_logic: formData.ticket_authority_logic || null,
        bail_status: formData.bail_status,
        bnss_references: formData.bnss_references,
        prayer_for_cognizance: formData.prayer_for_cognizance,
        complainant_signature: formData.complainant_signature || null,
        forwarding_officer_name: formData.forwarding_officer_name || null,
        forwarding_officer_designation: formData.forwarding_officer_designation || null,
        forwarding_officer_signature: formData.forwarding_officer_signature || null,
        is_completed: complete,
      };

      if (existingForwarding) {
        const { error } = await supabase
          .from('court_forwardings')
          .update(forwardingData)
          .eq('id', existingForwarding.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('court_forwardings').insert(forwardingData);
        if (error) throw error;
      }

      toast({
        title: complete ? 'Court Forwarding Completed' : 'Court Forwarding Saved',
        description: complete ? 'Proceeding to final step...' : 'Draft saved successfully',
      });

      if (complete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving court forwarding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save court forwarding',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generateCourtForwardingPDF({ ...formData, caseData, accused });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-sm font-semibold">IN THE COURT OF {caseData.court_name || 'Ld. RJM/HOWRAH'}</p>
        <p className="text-lg font-bold mt-2">Complaint- Cum-Prosecution Report of Railway Act</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Railway</Label>
          <Input
            value={formData.railway_name}
            onChange={(e) => handleChange('railway_name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input
            value={formData.state_name}
            onChange={(e) => handleChange('state_name', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="p-4 border rounded-lg space-y-2 text-sm">
        <p><strong>Case No. with date and Section of Law:</strong> {caseData.case_number}, Dtd-{new Date(caseData.case_date).toLocaleDateString()} U/S-{caseData.section_of_law} of Railway Act</p>
        <p><strong>Name of Complainant:</strong> {formData.complainant_designation}/ {formData.complainant_name} of {caseData.post_name}</p>
        <p><strong>Name and address of accused person:</strong> {getAccusedAddress()}</p>
      </div>

      {/* Narrative */}
      <div className="space-y-2">
        <Label htmlFor="raid_description">Complaint Narrative *</Label>
        <Textarea
          id="raid_description"
          value={formData.raid_description}
          onChange={(e) => handleChange('raid_description', e.target.value)}
          rows={15}
          required
        />
      </div>

      {/* Bail Status */}
      <div className="space-y-2">
        <Label htmlFor="bail_status">Bail Status *</Label>
        <Textarea
          id="bail_status"
          value={formData.bail_status}
          onChange={(e) => handleChange('bail_status', e.target.value)}
          rows={2}
          required
        />
      </div>

      {/* Prayer */}
      <div className="space-y-2">
        <Label htmlFor="prayer_for_cognizance">Prayer for Cognizance *</Label>
        <Textarea
          id="prayer_for_cognizance"
          value={formData.prayer_for_cognizance}
          onChange={(e) => handleChange('prayer_for_cognizance', e.target.value)}
          rows={2}
          required
        />
      </div>

      {/* Complainant Signature */}
      <div className="space-y-4 p-4 border rounded-lg">
        <Label className="text-base font-semibold">Complainant</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.complainant_name}
              onChange={(e) => handleChange('complainant_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input
              value={formData.complainant_designation}
              onChange={(e) => handleChange('complainant_designation', e.target.value)}
              required
            />
          </div>
        </div>
        <SignaturePad
          label="Complainant Signature"
          value={formData.complainant_signature}
          onChange={(sig) => handleChange('complainant_signature', sig)}
          required
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        {existingForwarding?.is_completed && (
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

export default CourtForwardingForm;
