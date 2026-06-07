import { useEffect } from "react";
import { create } from "zustand";
import { FoodEntry, Measurement, NutritionPhase, Session, NutritionGoals, NutritionGoalHistory } from "../types";

const API_BASE = "http://localhost:3000/api";

type Store = {
  token: string | null;
  username: string | null;
  sessions: Session[];
  measurements: Measurement[];
  foods: FoodEntry[];
  goals?: NutritionGoals;
  goalHistory: NutritionGoalHistory[];
  userCreatedAt: string | null;
  isLoading: boolean;
  weightUnit: "kg" | "lbs";
  setWeightUnit: (unit: "kg" | "lbs") => void;
  
  // Authentication Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Data Sync Actions
  fetchInitialData: () => Promise<void>;
  markSession: (session: Session) => Promise<void>;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  upsertGoals: (goals: NutritionGoals) => Promise<void>;
  deleteGoals: () => Promise<void>;
  deleteGoalHistory: (id: number) => Promise<void>;
  addFood: (entry: FoodEntry) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
};

// Retrieve cached auth token and username on startup
const savedToken = localStorage.getItem("gymbro_token");
const savedUsername = localStorage.getItem("gymbro_username");
const savedUserCreatedAt = localStorage.getItem("gymbro_user_created_at");
const savedWeightUnit = localStorage.getItem("gymbro_weight_unit") as "kg" | "lbs" | null;

export const useLocalStore = create<Store>((set, get) => ({
  token: savedToken,
  username: savedUsername,
  userCreatedAt: savedUserCreatedAt,
  sessions: [],
  measurements: [],
  foods: [],
  goals: undefined,
  goalHistory: [],
  isLoading: false,
  weightUnit: savedWeightUnit || "kg",

  setWeightUnit: (unit: "kg" | "lbs") => {
    localStorage.setItem("gymbro_weight_unit", unit);
    set({ weightUnit: unit });
  },

  // Login handler
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const { token, username: returnedUsername, createdAt } = await res.json();

      // Save token to localStorage to persist session
      localStorage.setItem("gymbro_token", token);
      localStorage.setItem("gymbro_username", returnedUsername);
      if (createdAt) {
        localStorage.setItem("gymbro_user_created_at", createdAt);
      }

      set({ token, username: returnedUsername, userCreatedAt: createdAt || null });
      await get().fetchInitialData(); // Load the logged-in user's database records
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  },

  // Register handler
  register: async (username, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  },

  // Logout handler
  logout: () => {
    localStorage.removeItem("gymbro_token");
    localStorage.removeItem("gymbro_username");
    localStorage.removeItem("gymbro_user_created_at");
    set({
      token: null,
      username: null,
      userCreatedAt: null,
      sessions: [],
      measurements: [],
      foods: [],
      goals: undefined,
    });
  },

  // Fetch data with token authorization
  fetchInitialData: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sessionsRes, measurementsRes, foodsRes, goalsRes, historyRes, meRes] = await Promise.all([
        fetch(`${API_BASE}/sessions`, { headers }),
        fetch(`${API_BASE}/measurements`, { headers }),
        fetch(`${API_BASE}/foods`, { headers }),
        fetch(`${API_BASE}/foods/goals`, { headers }),
        fetch(`${API_BASE}/foods/goals/history`, { headers }),
        fetch(`${API_BASE}/auth/me`, { headers }),
      ]);

      if (
        sessionsRes.status === 401 || sessionsRes.status === 403 ||
        measurementsRes.status === 401 || measurementsRes.status === 403 ||
        foodsRes.status === 401 || foodsRes.status === 403 ||
        goalsRes.status === 401 || goalsRes.status === 403
      ) {
        get().logout();
        return;
      }

      const sessions = sessionsRes.ok ? await sessionsRes.json() : [];
      const measurements = measurementsRes.ok ? await measurementsRes.json() : [];
      const foods = foodsRes.ok ? await foodsRes.json() : [];
      const goals = goalsRes.ok ? await goalsRes.json() : null;
      const goalHistory = historyRes.ok ? await historyRes.json() : [];
      const me = meRes.ok ? await meRes.json() : null;

      if (me && me.createdAt) {
        localStorage.setItem("gymbro_user_created_at", me.createdAt);
      }

      set({
        sessions,
        measurements,
        foods,
        goals: goals || undefined,
        goalHistory,
        userCreatedAt: me?.createdAt || get().userCreatedAt,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      set({ isLoading: false });
    }
  },

  // Save session with authorization header
  markSession: async (session) => {
    const token = get().token;
    if (!token) return;

    const newSessionDate = new Date(session.performedAt).toISOString().slice(0, 10);
    set((state) => {
      const filtered = state.sessions.filter((s) => {
        const sDate = new Date(s.performedAt).toISOString().slice(0, 10);
        return sDate !== newSessionDate;
      });
      return { sessions: [session, ...filtered] };
    });
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(session),
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  },

  // Save measurement with authorization header
  addMeasurement: async (measurement) => {
    const token = get().token;
    if (!token) return;

    set((state) => {
      const filtered = state.measurements.filter((m) => m.date !== measurement.date);
      return {
        measurements: [measurement, ...filtered].sort((a, b) => b.date.localeCompare(a.date)),
      };
    });

    try {
      const res = await fetch(`${API_BASE}/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(measurement),
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to save measurement:", err);
    }
  },

  // Save targets with authorization header
  upsertGoals: async (goals) => {
    const token = get().token;
    if (!token) return;

    set({ goals });
    try {
      const res = await fetch(`${API_BASE}/foods/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goals),
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to save goals:", err);
    }
  },

  // Delete current nutrition goals
  deleteGoals: async () => {
    const token = get().token;
    if (!token) return;

    set({ goals: undefined });
    try {
      const res = await fetch(`${API_BASE}/foods/goals`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      } else if (res.ok) {
        const historyRes = await fetch(`${API_BASE}/foods/goals/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.ok) {
          set({ goalHistory: await historyRes.json() });
        }
      }
    } catch (err) {
      console.error("Failed to delete goals:", err);
    }
  },

  // Delete historical goal
  deleteGoalHistory: async (id) => {
    const token = get().token;
    if (!token) return;

    set((state) => ({ goalHistory: state.goalHistory.filter((h) => h.id !== id) }));
    try {
      const res = await fetch(`${API_BASE}/foods/goals/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to delete goal history:", err);
    }
  },

  // Save food logs with authorization header
  addFood: async (entry) => {
    const token = get().token;
    if (!token) return;

    set((state) => ({ foods: [entry, ...state.foods] }));
    try {
      const res = await fetch(`${API_BASE}/foods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entry),
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to add food:", err);
    }
  },

  // Delete food logs with authorization header
  removeFood: async (id) => {
    const token = get().token;
    if (!token) return;

    set((state) => ({ foods: state.foods.filter((f) => f.id !== id) }));
    try {
      const res = await fetch(`${API_BASE}/foods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        get().logout();
      }
    } catch (err) {
      console.error("Failed to remove food:", err);
    }
  },


}));

export const usePersistedEffect = () => {
  const { fetchInitialData, token, goals } = useLocalStore();

  // Fetch logs whenever the user logs in (token changes)
  useEffect(() => {
    if (token) {
      fetchInitialData();
    }
  }, [fetchInitialData, token]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [goals]);
};
