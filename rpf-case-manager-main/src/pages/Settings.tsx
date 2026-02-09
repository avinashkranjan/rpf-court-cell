import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Shield,
  Activity,
  Clock,
  Save,
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  Bell,
  Lock,
  Smartphone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logActivity, getActionLabel, getEntityIcon } from '@/lib/activityLogger';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const Settings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    designation: profile?.designation || '',
    belt_number: profile?.belt_number || '',
    post_name: profile?.post_name || '',
    railway_zone: profile?.railway_zone || '',
    phone: profile?.phone || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        designation: profile.designation || '',
        belt_number: profile.belt_number || '',
        post_name: profile.post_name || '',
        railway_zone: profile.railway_zone || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          designation: formData.designation,
          belt_number: formData.belt_number || null,
          post_name: formData.post_name,
          railway_zone: formData.railway_zone,
          phone: formData.phone || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await logActivity('profile_updated', 'profile', user.id);
      await refreshProfile();

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('completed') || action.includes('generated')) {
      return 'default';
    }
    if (action.includes('created') || action.includes('added')) {
      return 'secondary';
    }
    if (action.includes('login')) {
      return 'outline';
    }
    return 'secondary';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view activity
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => handleChange('designation', e.target.value)}
                        placeholder="e.g., SI, ASI, HC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="belt_number">Belt Number</Label>
                      <Input
                        id="belt_number"
                        value={formData.belt_number}
                        onChange={(e) => handleChange('belt_number', e.target.value)}
                        placeholder="Your belt number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="e.g., 9876543210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="post_name">Post Name</Label>
                      <Input
                        id="post_name"
                        value={formData.post_name}
                        onChange={(e) => handleChange('post_name', e.target.value)}
                        placeholder="Your post name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="railway_zone">Railway Zone</Label>
                      <Input
                        id="railway_zone"
                        value={formData.railway_zone}
                        onChange={(e) => handleChange('railway_zone', e.target.value)}
                        placeholder="e.g., Eastern Railway"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at
                          ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed: Unknown
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified of new sign-ins
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <CardDescription>
                  Recent actions and changes in your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No activity recorded yet</p>
                    <p className="text-sm text-muted-foreground">
                      Your actions will appear here as you use the system
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {activityLogs.map((log, index) => (
                        <React.Fragment key={log.id}>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                              {getEntityIcon(log.entity_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">{getActionLabel(log.action)}</p>
                                <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">
                                  {log.entity_type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.details.case_number && `Case: ${log.details.case_number}`}
                                  {log.details.accused_name && ` • Accused: ${log.details.accused_name}`}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          {index < activityLogs.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
