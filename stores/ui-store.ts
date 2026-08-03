"use client";

import { create } from "zustand";

interface UiStoreState {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  isOfflineMode: boolean;
  isSyncing: boolean;
  toggleOfflineMode: () => void;

  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export const useUiStore = create<UiStoreState>()((set, get) => ({
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),

  isOfflineMode: false,
  isSyncing: false,
  toggleOfflineMode: () => {
    const goingOnline = get().isOfflineMode; // currently offline -> about to go online
    if (goingOnline) {
      set({ isSyncing: true });
      setTimeout(() => set({ isOfflineMode: false, isSyncing: false }), 1200);
    } else {
      set({ isOfflineMode: true });
    }
  },

  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
}));
