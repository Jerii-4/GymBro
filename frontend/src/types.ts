export type ExerciseSet = {
  reps: number;
  weight?: number;
  mode?: "reps" | "time";
  restSeconds?: number;
};

export type Exercise = {
  id: string;
  name: string;
  restSeconds?: number;
  sets: ExerciseSet[];
  mode?: "reps" | "time";
};

export type Session = {
  id: string;
  dayLabel: string;
  performedAt: string; // ISO string
  bodyWeightKg?: number;
  exercises: Exercise[];
};

export type Measurement = {
  date: string;
  heightCm?: number;
  weightKg?: number;
  bicepsCm?: number;
  forearmCm?: number;
  chestCm?: number;
  waistCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  bodyFatPct?: number;
};

export type NutritionPhase = "bulking" | "cutting" | "maintenance";

export type FoodEntry = {
  id: string;
  name: string;
  grams: number;
  protein: number;
  calories: number;
  source?: "manual" | "openfoodfacts" | "wger";
  loggedAt?: string;
};

export type NutritionGoals = {
  proteinTarget: number;
  calorieTarget: number;
  phase: NutritionPhase;
  currentWeight?: number;
  targetWeight?: number;
  months?: number;
  createdAt?: string;
};

export type NutritionGoalHistory = NutritionGoals & {
  id: number;
  startedAt: string;
  endedAt: string;
};


