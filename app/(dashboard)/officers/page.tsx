"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, Users, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

interface Officer {
  id: string;
  full_name: string;
  designation: string;
  post_name: string;
  railway_zone: string;
  phone: string | null;
  created_at: string | null;
}

interface RailwayPost {
  id: string;
  zone_name: string;
  post_name: string;
}

const Officers: React.FC = () => {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [posts, setPosts] = useState<RailwayPost[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    designation: "",
    post_name: "",
    railway_zone: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const designations = [
    "Constable",
    "Head Constable",
    "ASI",
    "SI",
    "Inspector",
    "SIP",
    "SIPF",
  ];

  useEffect(() => {
    fetchOfficers();
    fetchPosts();
  }, []);

  const fetchOfficers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (!error && data) {
      setOfficers(data);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("railway_posts").select("*");
    if (data) setPosts(data);
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

    if (!formData.full_name || !formData.designation || !formData.post_name) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingOfficer) {
        // Update existing officer
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            designation: formData.designation,
            post_name: formData.post_name,
            railway_zone: formData.railway_zone,
            phone: formData.phone || null,
          })
          .eq("id", editingOfficer.id);

        if (error) throw error;

        toast({
          title: "Officer Updated",
          description: "Officer details have been updated successfully",
        });
      } else {
        // Create new officer with credentials
        if (!formData.email || !formData.password) {
          toast({
            title: "Validation Error",
            description: "Email and password are required for new officers",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          designation: formData.designation,
          post_name: formData.post_name,
          railway_zone: formData.railway_zone,
          phone: formData.phone || null,
        });

        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        toast({
          title: "Officer Registered",
          description: "New officer has been registered successfully. They will receive a verification email.",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchOfficers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save officer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      designation: "",
      post_name: "",
      railway_zone: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setEditingOfficer(null);
  };

  const handleEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormData({
      full_name: officer.full_name,
      designation: officer.designation,
      post_name: officer.post_name,
      railway_zone: officer.railway_zone,
      phone: officer.phone || "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setDialogOpen(true);
  };

  const filteredOfficers = officers.filter(
    (o) =>
      o.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.post_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Officer Management</h1>
          <p className="text-muted-foreground">
            Manage RPF officers and their details
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Officer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingOfficer ? "Edit Officer" : "Officer Registration"}
              </DialogTitle>
              <DialogDescription>
                {editingOfficer
                  ? "Update officer details below"
                  : "Register a new officer with login credentials and profile information"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(v) =>
                      setFormData({ ...formData, designation: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
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

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g., 9876543210"
                />
              </div>

              {!editingOfficer && (
                <>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="officer.email@rpf.gov.in"
                      required={!editingOfficer}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="At least 6 characters"
                        required={!editingOfficer}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Re-enter password"
                        required={!editingOfficer}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Railway Post *</Label>
                <Select onValueChange={handlePostChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={formData.post_name || "Select post"}
                    />
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingOfficer ? "Update Officer" : "Register Officer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, designation, or post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Officers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Officers ({filteredOfficers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No officers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        {officer.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{officer.designation}</Badge>
                      </TableCell>
                      <TableCell>{officer.post_name}</TableCell>
                      <TableCell>{officer.phone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(officer)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Officers;
