"use client";

import { create } from "zustand";
import type { Role, UserAccount } from "@/types/domain";
import { johnDoeAccount, lindaDoeAccount, drSarahChenAccount } from "@/lib/mock/fixtures";

const ACCOUNTS_BY_ROLE: Record<"patient" | "caregiver" | "clinician", UserAccount> = {
  patient: johnDoeAccount,
  caregiver: lindaDoeAccount,
  clinician: drSarahChenAccount,
};

interface AuthStoreState {
  currentRole: Role | null;
  currentAccount: UserAccount | null;
  login: (role: "patient" | "caregiver" | "clinician") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  currentRole: null,
  currentAccount: null,
  login: (role) => set({ currentRole: role, currentAccount: ACCOUNTS_BY_ROLE[role] }),
  logout: () => set({ currentRole: null, currentAccount: null }),
}));
