import { create } from "zustand";

type LocationState = {
  pickedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  setPickedLocation: (loc: LocationState["pickedLocation"]) => void;
  clearPickedLocation: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  pickedLocation: null,
  setPickedLocation: (loc) => set({ pickedLocation: loc }),
  clearPickedLocation: () => set({ pickedLocation: null }),
}));