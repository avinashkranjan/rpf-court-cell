import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AccusedProfile } from "@/lib/types/case";

interface AccusedStore {
  accusedProfiles: AccusedProfile[];
  addAccused: (accused: AccusedProfile) => void;
  updateAccused: (id: string, accused: Partial<AccusedProfile>) => void;
  getAccusedByCaseId: (caseId: string) => AccusedProfile[];
  getAccusedById: (id: string) => AccusedProfile | undefined;
  checkDuplicate: (name: string, phone: string) => AccusedProfile | undefined;
}

export const useAccusedStore = create<AccusedStore>()(
  persist(
    (set, get) => ({
      accusedProfiles: [],

      addAccused: (accused) =>
        set((state) => ({
          accusedProfiles: [...state.accusedProfiles, accused],
        })),

      updateAccused: (id, accused) =>
        set((state) => ({
          accusedProfiles: state.accusedProfiles.map((a) =>
            a.id === id ? { ...a, ...accused, updatedAt: new Date().toISOString() } : a
          ),
        })),

      getAccusedByCaseId: (caseId) =>
        get().accusedProfiles.filter((a) => a.caseId === caseId),

      getAccusedById: (id) => get().accusedProfiles.find((a) => a.id === id),

      checkDuplicate: (name, phone) =>
        get().accusedProfiles.find(
          (a) =>
            a.name.toLowerCase() === name.toLowerCase() &&
            a.phone === phone
        ),
    }),
    {
      name: "rpf-accused-storage",
    }
  )
);
