import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FoodEntry, Measurement, MusicTrack, NutritionPhase, Session } from "../types";

type NutritionGoals = {
  proteinTarget: number;
  calorieTarget: number;
  phase: NutritionPhase;
};

type Store = {
  sessions: Session[];
  measurements: Measurement[];
  foods: FoodEntry[];
  goals?: NutritionGoals;
  tracks: MusicTrack[];
  markSession: (session: Session) => void;
  addMeasurement: (measurement: Measurement) => void;
  upsertGoals: (goals: NutritionGoals) => void;
  addFood: (entry: FoodEntry) => void;
  removeFood: (id: string) => void;
  addTracks: (tracks: MusicTrack[]) => void;
};

export const useLocalStore = create<Store>()(
  persist(
    (set) => ({
      sessions: [],
      measurements: [],
      foods: [],
      tracks: [],
      markSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions]
        })),
      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [measurement, ...state.measurements]
        })),
      upsertGoals: (goals) => set(() => ({ goals })),
      addFood: (entry) =>
        set((state) => ({
          foods: [entry, ...state.foods]
        })),
      removeFood: (id) =>
        set((state) => ({
          foods: state.foods.filter((f) => f.id !== id)
        })),
      addTracks: (tracks) =>
        set((state) => ({
          tracks: [...state.tracks, ...tracks]
        }))
    }),
    {
      name: "gymbro-store"
    }
  )
);

export const usePersistedEffect = () => {
  const { goals } = useLocalStore();
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [goals]);
};

