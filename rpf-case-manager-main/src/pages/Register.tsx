import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RailwayPost {
  id: string;
  zone_name: string;
  division: string;
  post_name: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    designation: '',
    belt_number: '',
    post_name: '',
    railway_zone: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<RailwayPost[]>([]);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('railway_posts').select('*');
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostChange = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setFormData({
        ...formData,
        post_name: post.post_name,
        railway_zone: post.zone_name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        designation: formData.designation,
        belt_number: formData.belt_number || null,
        post_name: formData.post_name,
        railway_zone: formData.railway_zone,
        phone: formData.phone || null,
      });

      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account',
        });
        navigate('/login');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const designations = [
    'Constable',
    'Head Constable',
    'ASI',
    'SI',
    'Inspector',
    'SIP',
    'SIPF',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Officer Registration</CardTitle>
          <CardDescription>
            Create your RPF Court Cell account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, designation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="belt_number">Belt Number</Label>
                <Input
                  id="belt_number"
                  name="belt_number"
                  placeholder="e.g., 12345"
                  value={formData.belt_number}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post">Railway Post *</Label>
              <Select onValueChange={handlePostChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your post" />
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="officer@rpf.gov.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
