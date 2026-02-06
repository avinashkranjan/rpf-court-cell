import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Case } from "@/lib/types/case";

interface CaseStore {
  cases: Case[];
  currentCase: Case | null;
  addCase: (caseData: Case) => void;
  updateCase: (id: string, caseData: Partial<Case>) => void;
  setCurrentCase: (caseData: Case | null) => void;
  getCaseById: (id: string) => Case | undefined;
  generateCaseNumber: () => string;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      cases: [],
      currentCase: null,

      addCase: (caseData) =>
        set((state) => ({
          cases: [...state.cases, caseData],
        })),

      updateCase: (id, caseData) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...caseData, updatedAt: new Date().toISOString() } : c
          ),
          currentCase:
            state.currentCase?.id === id
              ? { ...state.currentCase, ...caseData, updatedAt: new Date().toISOString() }
              : state.currentCase,
        })),

      setCurrentCase: (caseData) =>
        set(() => ({
          currentCase: caseData,
        })),

      getCaseById: (id) => get().cases.find((c) => c.id === id),

      generateCaseNumber: () => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const existingCases = get().cases.filter((c) =>
          c.caseNumber.startsWith(`RPF/${year}/${month}`)
        );
        const nextNumber = existingCases.length + 1;
        return `RPF/${year}/${month}/${String(nextNumber).padStart(4, "0")}`;
      },
    }),
    {
      name: "rpf-case-storage",
    }
  )
);
