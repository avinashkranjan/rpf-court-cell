"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, User, ClipboardList } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";

export default function CasesPage() {
  const router = useRouter();
  const { cases } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Case Management</h1>
          </div>
          <Button
            onClick={() => router.push("/dashboard/cases/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register New Case
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cases Registered</h3>
                <p className="text-gray-600 mb-4">
                  Start by registering your first case
                </p>
                <Button
                  onClick={() => router.push("/dashboard/cases/new")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Case
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => {
                const accusedCount = getAccusedByCaseId(caseItem.id).length;
                return (
                  <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {caseItem.caseNumber}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Registered: {new Date(caseItem.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            caseItem.status === "active"
                              ? "bg-green-100 text-green-800"
                              : caseItem.status === "forwarded"
                                ? "bg-blue-100 text-blue-800"
                                : caseItem.status === "closed"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {caseItem.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Zone</p>
                          <p className="font-medium">{caseItem.railwayZone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium">{caseItem.incidentLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sections</p>
                          <p className="font-medium">{caseItem.sectionsOfLaw.length} section(s)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{accusedCount} Accused</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4" />
                          <span>{caseItem.officersInvolved.length} Officers</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/cases/${caseItem.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/cases/${caseItem.id}/accused`)}
                        >
                          Manage Accused
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/cases/${caseItem.id}/memos`)}
                        >
                          Memos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}