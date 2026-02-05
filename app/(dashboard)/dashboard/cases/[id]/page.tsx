"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Users, Edit } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Case not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="w-full border-b bg-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/cases")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{caseData.caseNumber}</h1>
              <p className="text-sm text-gray-600">
                Registered: {new Date(caseData.registrationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/cases/${params.id}/accused`)}
            >
              <Users className="mr-2 h-4 w-4" />
              Accused ({accusedList.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/cases/${params.id}/memos`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Memos
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Case Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Case Information</CardTitle>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    caseData.status === "active"
                      ? "bg-green-100 text-green-800"
                      : caseData.status === "forwarded"
                        ? "bg-blue-100 text-blue-800"
                        : caseData.status === "closed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {caseData.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Railway Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Zone</p>
                      <p className="font-medium">{caseData.railwayZone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Post</p>
                      <p className="font-medium">{caseData.railwayPost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jurisdiction</p>
                      <p className="font-medium">{caseData.jurisdiction}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Incident Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{caseData.incidentLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Raid Start Time</p>
                      <p className="font-medium">
                        {new Date(caseData.raidStartTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Raid End Time</p>
                      <p className="font-medium">
                        {new Date(caseData.raidEndTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Sections of Law</h3>
                <div className="flex flex-wrap gap-2">
                  {caseData.sectionsOfLaw.map((section, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-sm text-gray-600 mb-2">Officers Involved</h3>
                <div className="flex flex-wrap gap-2">
                  {caseData.officersInvolved.map((officer, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                    >
                      {officer}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accused Profiles Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Accused Profiles</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/cases/${params.id}/accused`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {accusedList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No accused added yet</p>
              ) : (
                <div className="space-y-2">
                  {accusedList.map((accused) => (
                    <div
                      key={accused.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">{accused.name}</p>
                        <p className="text-sm text-gray-600">
                          {accused.age} years, {accused.phone}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {accused.district}, {accused.state}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}
                >
                  Add Accused Profile
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => router.push(`/dashboard/cases/${params.id}/memos`)}
                >
                  Create Memos
                </Button>
                <Button
                  variant="outline"
                  className="h-20"
                  onClick={() => alert("Generate Report - Coming Soon")}
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}