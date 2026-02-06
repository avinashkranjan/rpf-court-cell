import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ArrestMemo,
  SeizureMemo,
  PersonalSearchMemo,
  MedicalInspectionMemo,
  BNSSArrestChecklist,
  CourtForwardingReport,
  AccusedChallan,
} from "@/lib/types/case";

interface MemoStore {
  arrestMemos: ArrestMemo[];
  seizureMemos: SeizureMemo[];
  personalSearchMemos: PersonalSearchMemo[];
  medicalInspectionMemos: MedicalInspectionMemo[];
  bnssChecklists: BNSSArrestChecklist[];
  courtForwardingReports: CourtForwardingReport[];
  accusedChallans: AccusedChallan[];

  // Arrest Memo
  addArrestMemo: (memo: ArrestMemo) => void;
  updateArrestMemo: (id: string, memo: Partial<ArrestMemo>) => void;
  getArrestMemosByCaseId: (caseId: string) => ArrestMemo[];

  // Seizure Memo
  addSeizureMemo: (memo: SeizureMemo) => void;
  updateSeizureMemo: (id: string, memo: Partial<SeizureMemo>) => void;
  getSeizureMemosByCaseId: (caseId: string) => SeizureMemo[];

  // Personal Search Memo
  addPersonalSearchMemo: (memo: PersonalSearchMemo) => void;
  updatePersonalSearchMemo: (id: string, memo: Partial<PersonalSearchMemo>) => void;
  getPersonalSearchMemosByCaseId: (caseId: string) => PersonalSearchMemo[];

  // Medical Inspection Memo
  addMedicalInspectionMemo: (memo: MedicalInspectionMemo) => void;
  updateMedicalInspectionMemo: (id: string, memo: Partial<MedicalInspectionMemo>) => void;
  getMedicalInspectionMemosByCaseId: (caseId: string) => MedicalInspectionMemo[];

  // BNSS Checklist
  addBNSSChecklist: (checklist: BNSSArrestChecklist) => void;
  updateBNSSChecklist: (id: string, checklist: Partial<BNSSArrestChecklist>) => void;
  getBNSSChecklistsByCaseId: (caseId: string) => BNSSArrestChecklist[];

  // Court Forwarding Report
  addCourtForwardingReport: (report: CourtForwardingReport) => void;
  updateCourtForwardingReport: (id: string, report: Partial<CourtForwardingReport>) => void;
  getCourtForwardingReportsByCaseId: (caseId: string) => CourtForwardingReport[];

  // Accused Challan
  addAccusedChallan: (challan: AccusedChallan) => void;
  updateAccusedChallan: (id: string, challan: Partial<AccusedChallan>) => void;
  getAccusedChallansByCaseId: (caseId: string) => AccusedChallan[];
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      arrestMemos: [],
      seizureMemos: [],
      personalSearchMemos: [],
      medicalInspectionMemos: [],
      bnssChecklists: [],
      courtForwardingReports: [],
      accusedChallans: [],

      // Arrest Memo
      addArrestMemo: (memo) =>
        set((state) => ({
          arrestMemos: [...state.arrestMemos, memo],
        })),

      updateArrestMemo: (id, memo) =>
        set((state) => ({
          arrestMemos: state.arrestMemos.map((m) =>
            m.id === id ? { ...m, ...memo, updatedAt: new Date().toISOString() } : m
          ),
        })),

      getArrestMemosByCaseId: (caseId) =>
        get().arrestMemos.filter((m) => m.caseId === caseId),

      // Seizure Memo
      addSeizureMemo: (memo) =>
        set((state) => ({
          seizureMemos: [...state.seizureMemos, memo],
        })),

      updateSeizureMemo: (id, memo) =>
        set((state) => ({
          seizureMemos: state.seizureMemos.map((m) =>
            m.id === id ? { ...m, ...memo, updatedAt: new Date().toISOString() } : m
          ),
        })),

      getSeizureMemosByCaseId: (caseId) =>
        get().seizureMemos.filter((m) => m.caseId === caseId),

      // Personal Search Memo
      addPersonalSearchMemo: (memo) =>
        set((state) => ({
          personalSearchMemos: [...state.personalSearchMemos, memo],
        })),

      updatePersonalSearchMemo: (id, memo) =>
        set((state) => ({
          personalSearchMemos: state.personalSearchMemos.map((m) =>
            m.id === id ? { ...m, ...memo, updatedAt: new Date().toISOString() } : m
          ),
        })),

      getPersonalSearchMemosByCaseId: (caseId) =>
        get().personalSearchMemos.filter((m) => m.caseId === caseId),

      // Medical Inspection Memo
      addMedicalInspectionMemo: (memo) =>
        set((state) => ({
          medicalInspectionMemos: [...state.medicalInspectionMemos, memo],
        })),

      updateMedicalInspectionMemo: (id, memo) =>
        set((state) => ({
          medicalInspectionMemos: state.medicalInspectionMemos.map((m) =>
            m.id === id ? { ...m, ...memo, updatedAt: new Date().toISOString() } : m
          ),
        })),

      getMedicalInspectionMemosByCaseId: (caseId) =>
        get().medicalInspectionMemos.filter((m) => m.caseId === caseId),

      // BNSS Checklist
      addBNSSChecklist: (checklist) =>
        set((state) => ({
          bnssChecklists: [...state.bnssChecklists, checklist],
        })),

      updateBNSSChecklist: (id, checklist) =>
        set((state) => ({
          bnssChecklists: state.bnssChecklists.map((c) =>
            c.id === id ? { ...c, ...checklist, updatedAt: new Date().toISOString() } : c
          ),
        })),

      getBNSSChecklistsByCaseId: (caseId) =>
        get().bnssChecklists.filter((c) => c.caseId === caseId),

      // Court Forwarding Report
      addCourtForwardingReport: (report) =>
        set((state) => ({
          courtForwardingReports: [...state.courtForwardingReports, report],
        })),

      updateCourtForwardingReport: (id, report) =>
        set((state) => ({
          courtForwardingReports: state.courtForwardingReports.map((r) =>
            r.id === id ? { ...r, ...report, updatedAt: new Date().toISOString() } : r
          ),
        })),

      getCourtForwardingReportsByCaseId: (caseId) =>
        get().courtForwardingReports.filter((r) => r.caseId === caseId),

      // Accused Challan
      addAccusedChallan: (challan) =>
        set((state) => ({
          accusedChallans: [...state.accusedChallans, challan],
        })),

      updateAccusedChallan: (id, challan) =>
        set((state) => ({
          accusedChallans: state.accusedChallans.map((c) =>
            c.id === id ? { ...c, ...challan, updatedAt: new Date().toISOString() } : c
          ),
        })),

      getAccusedChallansByCaseId: (caseId) =>
        get().accusedChallans.filter((c) => c.caseId === caseId),
    }),
    {
      name: "rpf-memo-storage",
    }
  )
);
