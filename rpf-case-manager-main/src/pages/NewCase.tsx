import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface AccusedData {
  full_name: string;
  father_name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  mobile_number: string;
  address_line1: string;
  village_town: string;
  post_office: string;
  police_station: string;
  district: string;
  state: string;
  pincode: string;
  has_valid_ticket: boolean;
  ticket_number: string;
  ticket_from: string;
  ticket_to: string;
}

const NewCase: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<RailwayPost[]>([]);
  const [sections, setSections] = useState<LawSection[]>([]);

  const [caseData, setCaseData] = useState({
    railway_zone: profile?.railway_zone || '',
    post_name: profile?.post_name || '',
    jurisdiction: '',
    section_of_law: '',
    incident_location: '',
    platform_number: '',
    station_name: '',
    train_number: '',
    train_name: '',
    coach_number: '',
    raid_start_time: '',
    raid_end_time: '',
    gd_entry_number: '',
    court_name: '',
    court_production_date: '',
    court_production_time: '',
    remarks: '',
  });

  const [accusedList, setAccusedList] = useState<AccusedData[]>([
    {
      full_name: '',
      father_name: '',
      age: '',
      gender: 'male',
      mobile_number: '',
      address_line1: '',
      village_town: '',
      post_office: '',
      police_station: '',
      district: '',
      state: '',
      pincode: '',
      has_valid_ticket: false,
      ticket_number: '',
      ticket_from: '',
      ticket_to: '',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [postsRes, sectionsRes] = await Promise.all([
        supabase.from('railway_posts').select('*'),
        supabase.from('law_sections').select('*'),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
    };
    fetchData();
  }, []);

  const handleCaseChange = (field: string, value: string) => {
    setCaseData({ ...caseData, [field]: value });
  };

  const handlePostChange = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setCaseData({
        ...caseData,
        railway_zone: post.zone_name,
        post_name: post.post_name,
        jurisdiction: post.court_jurisdiction || '',
        court_name: post.court_name || '',
      });
    }
  };

  const handleAccusedChange = (index: number, field: keyof AccusedData, value: string | boolean) => {
    const updated = [...accusedList];
    (updated[index] as any)[field] = value;
    setAccusedList(updated);
  };

  const addAccused = () => {
    setAccusedList([
      ...accusedList,
      {
        full_name: '',
        father_name: '',
        age: '',
        gender: 'male',
        mobile_number: '',
        address_line1: '',
        village_town: '',
        post_office: '',
        police_station: '',
        district: '',
        state: '',
        pincode: '',
        has_valid_ticket: false,
        ticket_number: '',
        ticket_from: '',
        ticket_to: '',
      },
    ]);
  };

  const removeAccused = (index: number) => {
    if (accusedList.length > 1) {
      setAccusedList(accusedList.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    // Validate accused
    for (const accused of accusedList) {
      if (!accused.full_name || !accused.father_name || !accused.age) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required accused details',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Create case
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          case_number: '', // Auto-generated by trigger
          railway_zone: caseData.railway_zone,
          post_name: caseData.post_name,
          jurisdiction: caseData.jurisdiction || null,
          section_of_law: caseData.section_of_law,
          incident_location: caseData.incident_location,
          platform_number: caseData.platform_number || null,
          station_name: caseData.station_name,
          train_number: caseData.train_number || null,
          train_name: caseData.train_name || null,
          coach_number: caseData.coach_number || null,
          raid_start_time: caseData.raid_start_time || null,
          raid_end_time: caseData.raid_end_time || null,
          gd_entry_number: caseData.gd_entry_number || null,
          court_name: caseData.court_name || null,
          court_production_date: caseData.court_production_date || null,
          court_production_time: caseData.court_production_time || null,
          remarks: caseData.remarks || null,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Create accused records
      const accusedRecords = accusedList.map((accused) => ({
        case_id: newCase.id,
        full_name: accused.full_name,
        father_name: accused.father_name,
        age: parseInt(accused.age),
        gender: accused.gender,
        mobile_number: accused.mobile_number || null,
        address_line1: accused.address_line1,
        village_town: accused.village_town || null,
        post_office: accused.post_office || null,
        police_station: accused.police_station || null,
        district: accused.district,
        state: accused.state,
        pincode: accused.pincode || null,
        has_valid_ticket: accused.has_valid_ticket,
        ticket_number: accused.ticket_number || null,
        ticket_from: accused.ticket_from || null,
        ticket_to: accused.ticket_to || null,
      }));

      const { error: accusedError } = await supabase.from('accused').insert(accusedRecords);

      if (accusedError) throw accusedError;

      // Add current officer to case officers
      await supabase.from('case_officers').insert({
        case_id: newCase.id,
        officer_id: user.id,
        officer_name: profile?.full_name || 'Unknown',
        designation: profile?.designation || 'Officer',
        role_in_case: 'Registering Officer',
      });

      toast({
        title: 'Case Registered',
        description: `Case ${newCase.case_number} created successfully`,
      });

      navigate(`/cases/${newCase.id}`);
    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create case',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Register New Case</h1>
          <p className="text-muted-foreground">
            Fill in the case details and accused information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Details */}
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
              <CardDescription>Basic case information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    value={caseData.section_of_law}
                    onValueChange={(v) => handleCaseChange('section_of_law', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.section_code}>
                          {section.section_code} - {section.act_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="station_name">Station Name *</Label>
                  <Input
                    id="station_name"
                    value={caseData.station_name}
                    onChange={(e) => handleCaseChange('station_name', e.target.value)}
                    placeholder="e.g., Howrah"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_number">Platform Number</Label>
                  <Input
                    id="platform_number"
                    value={caseData.platform_number}
                    onChange={(e) => handleCaseChange('platform_number', e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident_location">Incident Location *</Label>
                <Input
                  id="incident_location"
                  value={caseData.incident_location}
                  onChange={(e) => handleCaseChange('incident_location', e.target.value)}
                  placeholder="e.g., Platform 10, Near Coach S2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="train_number">Train Number</Label>
                  <Input
                    id="train_number"
                    value={caseData.train_number}
                    onChange={(e) => handleCaseChange('train_number', e.target.value)}
                    placeholder="e.g., 12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="train_name">Train Name</Label>
                  <Input
                    id="train_name"
                    value={caseData.train_name}
                    onChange={(e) => handleCaseChange('train_name', e.target.value)}
                    placeholder="e.g., Rajdhani Express"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coach_number">Coach Number</Label>
                  <Input
                    id="coach_number"
                    value={caseData.coach_number}
                    onChange={(e) => handleCaseChange('coach_number', e.target.value)}
                    placeholder="e.g., ER-128121"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="raid_start_time">Raid Start Time</Label>
                  <Input
                    id="raid_start_time"
                    type="time"
                    value={caseData.raid_start_time}
                    onChange={(e) => handleCaseChange('raid_start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raid_end_time">Raid End Time</Label>
                  <Input
                    id="raid_end_time"
                    type="time"
                    value={caseData.raid_end_time}
                    onChange={(e) => handleCaseChange('raid_end_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gd_entry_number">GD Entry Number</Label>
                  <Input
                    id="gd_entry_number"
                    value={caseData.gd_entry_number}
                    onChange={(e) => handleCaseChange('gd_entry_number', e.target.value)}
                    placeholder="e.g., 123/2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="court_name">Court Name</Label>
                  <Input
                    id="court_name"
                    value={caseData.court_name}
                    onChange={(e) => handleCaseChange('court_name', e.target.value)}
                    placeholder="e.g., Ld. RJM/Howrah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="court_production_date">Court Production Date</Label>
                  <Input
                    id="court_production_date"
                    type="date"
                    value={caseData.court_production_date}
                    onChange={(e) => handleCaseChange('court_production_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="court_production_time">Court Production Time</Label>
                  <Input
                    id="court_production_time"
                    type="time"
                    value={caseData.court_production_time}
                    onChange={(e) => handleCaseChange('court_production_time', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={caseData.remarks}
                  onChange={(e) => handleCaseChange('remarks', e.target.value)}
                  placeholder="Any additional remarks..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accused Details */}
          {accusedList.map((accused, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Accused #{index + 1}</CardTitle>
                  <CardDescription>Personal details of the accused person</CardDescription>
                </div>
                {accusedList.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAccused(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={accused.full_name}
                      onChange={(e) => handleAccusedChange(index, 'full_name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Name *</Label>
                    <Input
                      value={accused.father_name}
                      onChange={(e) => handleAccusedChange(index, 'father_name', e.target.value)}
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      value={accused.age}
                      onChange={(e) => handleAccusedChange(index, 'age', e.target.value)}
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
                      value={accused.gender}
                      onValueChange={(v) => handleAccusedChange(index, 'gender', v)}
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
                      value={accused.mobile_number}
                      onChange={(e) => handleAccusedChange(index, 'mobile_number', e.target.value)}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      value={accused.pincode}
                      onChange={(e) => handleAccusedChange(index, 'pincode', e.target.value)}
                      placeholder="e.g., 700001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input
                    value={accused.address_line1}
                    onChange={(e) => handleAccusedChange(index, 'address_line1', e.target.value)}
                    placeholder="Street address / Village"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Village/Town</Label>
                    <Input
                      value={accused.village_town}
                      onChange={(e) => handleAccusedChange(index, 'village_town', e.target.value)}
                      placeholder="Village or town name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Post Office</Label>
                    <Input
                      value={accused.post_office}
                      onChange={(e) => handleAccusedChange(index, 'post_office', e.target.value)}
                      placeholder="Post office name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Police Station</Label>
                    <Input
                      value={accused.police_station}
                      onChange={(e) => handleAccusedChange(index, 'police_station', e.target.value)}
                      placeholder="Police station name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Input
                      value={accused.district}
                      onChange={(e) => handleAccusedChange(index, 'district', e.target.value)}
                      placeholder="District name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={accused.state}
                      onValueChange={(v) => handleAccusedChange(index, 'state', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ticket Number</Label>
                    <Input
                      value={accused.ticket_number}
                      onChange={(e) => handleAccusedChange(index, 'ticket_number', e.target.value)}
                      placeholder="If any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ticket From</Label>
                    <Input
                      value={accused.ticket_from}
                      onChange={(e) => handleAccusedChange(index, 'ticket_from', e.target.value)}
                      placeholder="Station from"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ticket To</Label>
                    <Input
                      value={accused.ticket_to}
                      onChange={(e) => handleAccusedChange(index, 'ticket_to', e.target.value)}
                      placeholder="Station to"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addAccused} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Another Accused
          </Button>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/cases')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Case
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default NewCase;
