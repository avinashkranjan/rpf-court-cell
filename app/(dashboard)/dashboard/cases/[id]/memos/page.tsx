"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, ClipboardList, Activity, Stethoscope, CheckSquare, Scale, FileCheck } from "lucide-react";
import { useCaseStore } from "@/lib/store/case-store";
import { useAccusedStore } from "@/lib/store/accused-store";
import { useMemoStore } from "@/lib/store/memo-store";

export default function MemosPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getCaseById } = useCaseStore();
  const { getAccusedByCaseId } = useAccusedStore();
  const {
    getArrestMemosByCaseId,
    getSeizureMemosByCaseId,
    getPersonalSearchMemosByCaseId,
    getMedicalInspectionMemosByCaseId,
    getBNSSChecklistsByCaseId,
  } = useMemoStore();

  const caseData = getCaseById(params.id);
  const accusedList = getAccusedByCaseId(params.id);
  const arrestMemos = getArrestMemosByCaseId(params.id);
  const seizureMemos = getSeizureMemosByCaseId(params.id);
  const searchMemos = getPersonalSearchMemosByCaseId(params.id);
  const medicalMemos = getMedicalInspectionMemosByCaseId(params.id);
  const bnssChecklists = getBNSSChecklistsByCaseId(params.id);

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Case not found</p>
      </div>
    );
  }

  const memoTypes = [
    {
      title: "Arrest Memo (Annexure-A)",
      description: "Digital arrest memo with BNSS compliance",
      icon: FileText,
      count: arrestMemos.length,
      path: `/dashboard/cases/${params.id}/memos/arrest`,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Seizure Memo",
      description: "Record seized items and evidence",
      icon: ClipboardList,
      count: seizureMemos.length,
      path: `/dashboard/cases/${params.id}/memos/seizure`,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Personal Search Memo",
      description: "Document personal search details",
      icon: Activity,
      count: searchMemos.length,
      path: `/dashboard/cases/${params.id}/memos/personal-search`,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Medical Inspection Memo",
      description: "Record medical examination details",
      icon: Stethoscope,
      count: medicalMemos.length,
      path: `/dashboard/cases/${params.id}/memos/medical`,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "BNSS Arrest Checklist",
      description: "Mandatory BNSS compliance checklist",
      icon: CheckSquare,
      count: bnssChecklists.length,
      path: `/dashboard/cases/${params.id}/memos/bnss-checklist`,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Court Forwarding Report",
      description: "Generate complaint-cum-PR report",
      icon: Scale,
      count: 0,
      path: `/dashboard/cases/${params.id}/memos/court-forward`,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Accused Challan",
      description: "Generate master challan for court",
      icon: FileCheck,
      count: 0,
      path: `/dashboard/cases/${params.id}/memos/challan`,
      color: "bg-teal-50 text-teal-600",
    },
  ];

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
              <h1 className="text-xl font-bold text-gray-800">Memos & Documents</h1>
              <p className="text-sm text-gray-600">Case: {caseData.caseNumber}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status Check */}
          {accusedList.length === 0 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please add at least one accused profile before creating memos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(`/dashboard/cases/${params.id}/accused/new`)}
                >
                  Add Accused Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Memo Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoTypes.map((memoType) => {
              const Icon = memoType.icon;
              return (
                <Card
                  key={memoType.path}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (accusedList.length === 0) {
                      alert("Please add accused profiles first");
                      return;
                    }
                    router.push(memoType.path);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${memoType.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {memoType.count > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {memoType.count}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{memoType.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{memoType.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (accusedList.length === 0) {
                          alert("Please add accused profiles first");
                          return;
                        }
                        router.push(memoType.path);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Memos */}
          {(arrestMemos.length > 0 || seizureMemos.length > 0 || searchMemos.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Memos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {arrestMemos.slice(-3).reverse().map((memo) => (
                    <div
                      key={memo.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">Arrest Memo</p>
                          <p className="text-sm text-gray-600">
                            {new Date(memo.arrestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                  {seizureMemos.slice(-3).reverse().map((memo) => (
                    <div
                      key={memo.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-semibold">Seizure Memo</p>
                          <p className="text-sm text-gray-600">
                            {new Date(memo.seizureDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}