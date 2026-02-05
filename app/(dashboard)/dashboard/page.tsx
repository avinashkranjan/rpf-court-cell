"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FileText, Users, ClipboardList, Scale, BarChart3, Settings } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";

export default function DashboardPage() {
  const router = useRouter();
  const { cases } = useCaseStore();
  const { accusedProfiles } = useAccusedStore();
  const { arrestMemos, courtForwardingReports } = useMemoStore();

  const handleLogout = () => {
    localStorage.removeItem("rpf_auth");
    router.push("/login");
  };

  const stats = [
    { 
      title: "Total Cases", 
      value: cases.length, 
      icon: FileText,
      color: "text-blue-600"
    },
    { 
      title: "Accused Profiles", 
      value: accusedProfiles.length, 
      icon: Users,
      color: "text-orange-600"
    },
    { 
      title: "Arrest Memos", 
      value: arrestMemos.length, 
      icon: ClipboardList,
      color: "text-green-600"
    },
    { 
      title: "Court Forwards", 
      value: courtForwardingReports.length, 
      icon: Scale,
      color: "text-purple-600"
    },
  ];

  const quickActions = [
    { label: "Register New Case", path: "/dashboard/cases/new", icon: FileText },
    { label: "View Cases", path: "/dashboard/cases", icon: FileText },
    { label: "Accused Profiles", path: "/dashboard/accused", icon: Users },
    { label: "Memos & Reports", path: "/dashboard/memos", icon: ClipboardList },
    { label: "Reports", path: "/dashboard/reports", icon: BarChart3 },
    { label: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold text-gray-800">RPF Court Cell Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-red-500 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.path}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      onClick={() => router.push(action.path)}
                    >
                      <Icon className="h-6 w-6" />
                      <span>{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No cases registered yet</p>
              ) : (
                <div className="space-y-2">
                  {cases.slice(-5).reverse().map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/cases/${c.id}`)}
                    >
                      <div>
                        <p className="font-semibold">{c.caseNumber}</p>
                        <p className="text-sm text-gray-600">{c.incidentLocation}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        c.status === 'active' ? 'bg-green-100 text-green-800' :
                        c.status === 'forwarded' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
