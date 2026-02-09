"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

interface Stats {
  totalCases: number;
  pendingCases: number;
  approvedCases: number;
  todayCases: number;
}

interface RecentCase {
  id: string;
  case_number: string;
  status: string;
  section_of_law: string;
  station_name: string;
  created_at: string | null;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCases: 0,
    pendingCases: 0,
    approvedCases: 0,
    todayCases: 0,
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cases count
        const { count: totalCount } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true });

        const { count: pendingCount } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .in("status", ["draft", "in_progress", "pending_approval"]);

        const { count: approvedCount } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved");

        const today = new Date().toISOString().split("T")[0];
        const { count: todayCount } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today);

        setStats({
          totalCases: totalCount || 0,
          pendingCases: pendingCount || 0,
          approvedCases: approvedCount || 0,
          todayCases: todayCount || 0,
        });

        // Fetch recent cases
        const { data: cases } = await supabase
          .from("cases")
          .select(
            "id, case_number, status, section_of_law, station_name, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentCases(cases || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "forwarded_to_court":
        return "text-[hsl(var(--success))]";
      case "pending_approval":
        return "text-[hsl(var(--warning))]";
      case "draft":
      case "in_progress":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {profile?.designation} {profile?.full_name}
          </h1>
          <p className="text-muted-foreground">
            {profile?.post_name} | {profile?.railway_zone}
          </p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Case
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              All registered cases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <Clock className="h-4 w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCases}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCases}</div>
            <p className="text-xs text-muted-foreground">Ready for court</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCases}</div>
            <p className="text-xs text-muted-foreground">
              Cases registered today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Cases</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cases">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : recentCases.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                No cases registered yet
              </p>
              <Button asChild className="mt-4">
                <Link href="/cases/new">Register First Case</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{caseItem.case_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {caseItem.section_of_law} | {caseItem.station_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${getStatusColor(caseItem.status)}`}
                    >
                      {formatStatus(caseItem.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(caseItem.created_at ?? "").toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
