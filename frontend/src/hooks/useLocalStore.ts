import { useEffect } from "react";
import { create } from "zustand";
import { FoodEntry, Measurement, MusicTrack, NutritionPhase, Session } from "../types";

const API_BASE = "http://localhost:3000/api";

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
  isLoading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  markSession: (session: Session) => Promise<void>;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  upsertGoals: (goals: NutritionGoals) => Promise<void>;
  addFood: (entry: FoodEntry) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  addTracks: (tracks: MusicTrack[]) => Promise<void>;
};

export const useLocalStore = create<Store>((set, get) => ({
  sessions: [],
  measurements: [],
  foods: [],
  goals: undefined,
  tracks: [],
  isLoading: false,

  // Load initial data from Express backend when app mounts
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [sessionsRes, measurementsRes, foodsRes, goalsRes, tracksRes] = await Promise.all([
        fetch(`${API_BASE}/sessions`),
        fetch(`${API_BASE}/measurements`),
        fetch(`${API_BASE}/foods`),
        fetch(`${API_BASE}/goals`),
        fetch(`${API_BASE}/tracks`),
      ]);

      const sessions = await sessionsRes.json();
      const measurements = await measurementsRes.json();
      const foods = await foodsRes.json();
      const goals = await goalsRes.json();
      const tracks = await tracksRes.json();

      set({
        sessions,
        measurements,
        foods,
        goals: goals || undefined,
        tracks,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch initial data from backend:", err);
      set({ isLoading: false });
    }
  },

  // Save session
  markSession: async (session) => {
    // Optimistic UI Update: immediately add the session to state so UI is instant
    set((state) => ({
      sessions: [session, ...state.sessions],
    }));

    try {
      await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
    } catch (err) {
      console.error("Failed to save session to backend database:", err);
    }
  },

  // Save weight & measurements
  addMeasurement: async (measurement) => {
    // Optimistic UI Update: replace/add measurement in local list
    set((state) => {
      const filtered = state.measurements.filter((m) => m.date !== measurement.date);
      return {
        measurements: [measurement, ...filtered].sort((a, b) => b.date.localeCompare(a.date)),
      };
    });

    try {
      await fetch(`${API_BASE}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(measurement),
      });
    } catch (err) {
      console.error("Failed to save measurement to backend database:", err);
    }
  },

  // Update nutrition goals
  upsertGoals: async (goals) => {
    set({ goals });
    try {
      await fetch(`${API_BASE}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });
    } catch (err) {
      console.error("Failed to save goals to backend database:", err);
    }
  },

  // Log food
  addFood: async (entry) => {
    set((state) => ({
      foods: [entry, ...state.foods],
    }));

    try {
      await fetch(`${API_BASE}/foods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Failed to save food log to backend database:", err);
    }
  },

  // Delete food log
  removeFood: async (id) => {
    set((state) => ({
      foods: state.foods.filter((f) => f.id !== id),
    }));

    try {
      await fetch(`${API_BASE}/foods/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete food log from backend database:", err);
    }
  },

  // Sync music tracks list
  addTracks: async (tracks) => {
    set((state) => ({
      tracks: [...state.tracks, ...tracks],
    }));

    try {
      await fetch(`${API_BASE}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks }),
      });
    } catch (err) {
      console.error("Failed to sync music tracks to backend database:", err);
    }
  },
}));

export const usePersistedEffect = () => {
  const { fetchInitialData, goals } = useLocalStore();

  // Load database records as soon as the app mounts
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [goals]);
};
