"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, User, Phone, MapPin } from "lucide-react";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useCaseStore } from "@/lib/store/case-store";

export default function AccusedListPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getAccusedByCaseId } = useAccusedStore();
  const { getCaseById } = useCaseStore();

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
              onClick={() => router.push(`/dashboard/cases/${params.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Accused Profiles</h1>
              <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Accused
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {accusedList.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Accused Added</h3>
                <p className="text-gray-600 mb-4">
                  Add accused profiles for this case
                </p>
                <Button
                  onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Accused
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accusedList.map((accused) => (
                <Card key={accused.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{accused.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          S/o {accused.fatherName}
                        </p>
                      </div>
                      {accused.photo && (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        {accused.age} years, {accused.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{accused.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{accused.district}, {accused.state}</span>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/cases/${params.id}/memos?accused=${accused.id}`)}
                      >
                        Create Memos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}