import { create } from 'zustand';

interface MapNavigationState {
  pendingEventId: string | null;
  setPendingEventId: (id: string | null) => void;
}

export const useMapNavigationStore = create<MapNavigationState>((set) => ({
  pendingEventId: null,
  setPendingEventId: (id) => set({ pendingEventId: id }),
}));
