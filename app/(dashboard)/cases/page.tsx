"use client";

import React, { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Eye, FileText } from "lucide-react";
import Link from "next/link";

interface Case {
  id: string;
  case_number: string;
  case_date: string;
  section_of_law: string;
  station_name: string;
  status: string;
  created_at: string | null;
}

const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("cases")
        .select(
          "id, case_number, case_date, section_of_law, station_name, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq(
          "status",
          statusFilter as
            | "approved"
            | "closed"
            | "draft"
            | "forwarded_to_court"
            | "in_progress"
            | "pending_approval",
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section_of_law.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600",
      in_progress: "bg-blue-100 text-blue-700",
      pending_approval: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      forwarded_to_court: "bg-emerald-100 text-emerald-700",
      closed: "bg-gray-100 text-gray-600",
    };

    return (
      <Badge className={colors[status] || ""}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">
            View and manage all registered cases
          </p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Case
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case number, station, or section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="forwarded_to_court">
                  Forwarded to Court
                </SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cases ({filteredCases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No cases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        {caseItem.case_number}
                      </TableCell>
                      <TableCell>
                        {new Date(caseItem.case_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{caseItem.section_of_law}</TableCell>
                      <TableCell>{caseItem.station_name}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cases/${caseItem.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
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

export default Cases;
