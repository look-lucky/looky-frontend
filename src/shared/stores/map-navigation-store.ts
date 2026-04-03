import { create } from 'zustand';

interface MapNavigationState {
  pendingEventId: string | null;
  pendingEventLocation: { lat: number; lng: number } | null;
  setPendingEventId: (id: string | null, location?: { lat: number; lng: number } | null) => void;
}

export const useMapNavigationStore = create<MapNavigationState>((set) => ({
  pendingEventId: null,
  pendingEventLocation: null,
  setPendingEventId: (id, location = null) => set({ pendingEventId: id, pendingEventLocation: location }),
}));
