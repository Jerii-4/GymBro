import React, { useMemo, useState } from "react";
import { FoodEntry, NutritionPhase } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

const uuid = () => crypto.randomUUID();

const ProgressRing = ({ value, target, label }: { value: number; target: number; label: string }) => {
  const clamped = Math.min(1, value / target);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference * clamped;
  return (
    <div className="progress-ring">
      <svg width="140" height="140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#1f2430"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#00f2fe"
          strokeWidth="12"
          strokeDasharray={`${stroke} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="label">
        <div>{label}</div>
        <strong>
          {Math.round(value)}/{target}
        </strong>
      </div>
    </div>
  );
};

const calcGoals = (weightKg: number, phase: NutritionPhase) => {
  const protein =
    phase === "bulking" ? weightKg * 2.2 : phase === "cutting" ? weightKg * 2 : weightKg * 1.8;
  const baseCalories = weightKg * 32;
  const calories =
    phase === "bulking" ? baseCalories + 300 : phase === "cutting" ? baseCalories - 300 : baseCalories;
  return { protein: Math.round(protein), calories: Math.round(calories) };
};

export const NutritionTracker: React.FC = () => {
  const { foods, goals, addFood, removeFood, upsertGoals } = useLocalStore();
  const [phase, setPhase] = useState<NutritionPhase>(goals?.phase ?? "maintenance");
  const [weight, setWeight] = useState<number | "">(70);
  const [name, setName] = useState("");
  const [grams, setGrams] = useState<number | "">(100);
  const [protein, setProtein] = useState<number | "">(0);
  const [calories, setCalories] = useState<number | "">(0);
  const [loading, setLoading] = useState(false);

  const totals = useMemo(
    () => foods.reduce((acc, f) => ({ protein: acc.protein + f.protein, calories: acc.calories + f.calories }), { protein: 0, calories: 0 }),
    [foods]
  );

  const handleGoals = () => {
    if (weight === "") return;
    const { protein: proteinTarget, calories: calorieTarget } = calcGoals(weight, phase);
    upsertGoals({ proteinTarget, calorieTarget, phase });
  };

  const handleAddFood = (source?: FoodEntry["source"]) => {
    if (!name || grams === "" || grams <= 0) return;
    addFood({
      id: uuid(),
      name,
      grams: Number(grams),
      protein: protein === "" ? 0 : Number(protein),
      calories: calories === "" ? 0 : Number(calories),
      source: source ?? "manual"
    });
    setName("");
    setProtein(0);
    setCalories(0);
  };

  const fetchOpenFoodFacts = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&json=1&page_size=1`
      );
      const data = await resp.json();
      const product = data.products?.[0];
      const protein100 = Number(product?.nutriments?.proteins_100g ?? 0);
      const kcal100 = Number(product?.nutriments?.["energy-kcal_100g"] ?? product?.nutriments?.energy_value ?? 0);
      setProtein((protein100 * Number(grams)) / 100);
      setCalories((kcal100 * Number(grams)) / 100);
      handleAddFood("openfoodfacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchWger = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://wger.de/api/v2/ingredient/?search=${encodeURIComponent(name)}`);
      const data = await resp.json();
      const ingredient = data.results?.[0];
      const protein100 = Number(ingredient?.protein ?? 0);
      const kcal100 = Number(ingredient?.energy ?? 0);
      setProtein((protein100 * Number(grams)) / 100);
      setCalories((kcal100 * Number(grams)) / 100);
      handleAddFood("wger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card scrollable-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <img src="/assets/nutrition.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
        <h2 style={{ margin: 0 }}>Protein & Calories</h2>
      </div>
      <div className="nutrition-columns-grid">
        {/* Left Column: Goals and Targets */}
        <div className="nutrition-column-left">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
            <div>
              <label>Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value as NutritionPhase)} style={{ margin: "4px 0 8px" }}>
                <option value="bulking">Bulking</option>
                <option value="cutting">Cutting</option>
                <option value="maintenance">Maintaining</option>
              </select>
            </div>
            <div>
              <label>Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Your current weight"
                style={{ margin: "4px 0 8px" }}
              />
            </div>
          </div>
          <button onClick={handleGoals} style={{ width: "100%", marginTop: "4px", marginBottom: "16px" }}>Set goals</button>

          {goals ? (
            <div className="grid" style={{ marginTop: 8, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", justifyItems: "center" }}>
              <ProgressRing value={totals.protein} target={goals.proteinTarget} label="Protein (g)" />
              <ProgressRing value={totals.calories} target={goals.calorieTarget} label="Calories" />
            </div>
          ) : (
            <p className="muted" style={{ margin: "16px 0 0" }}>Pick phase + weight to generate your targets.</p>
          )}
        </div>

        {/* Right Column: Add Food */}
        <div className="nutrition-column-right">
          <h3 style={{ margin: "0 0 12px" }}>Add food</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label>Food name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Chicken breast" style={{ margin: "4px 0 10px" }} />
            </div>
            <div>
              <label>Weight (g)</label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="100"
                style={{ margin: "4px 0 10px" }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
            <div>
              <label>Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 31"
                style={{ margin: "4px 0 10px" }}
              />
            </div>
            <div>
              <label>Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 165"
                style={{ margin: "4px 0 10px" }}
              />
            </div>
          </div>

          <div className="chips" style={{ marginTop: "16px" }}>
            <button onClick={() => handleAddFood("manual")}>Save manual</button>
            <button onClick={fetchOpenFoodFacts} disabled={loading}>
              Use OpenFoodFacts
            </button>
            <button onClick={fetchWger} disabled={loading}>
              Use WGER
            </button>
          </div>
        </div>
      </div>

      <div className="list" style={{ marginTop: 24, borderTop: "1px solid #1f2430", paddingTop: "16px" }}>
        {foods.length === 0 && <p className="muted">No foods logged yet.</p>}
        {foods.map((f) => (
          <div key={f.id} className="list-item">
            <div>
              <strong>{f.name}</strong> <span className="muted">{f.grams} g</span>
              <div className="muted">
                {Math.round(f.protein)} g protein · {Math.round(f.calories)} kcal{" "}
                {f.source ? `· ${f.source}` : ""}
              </div>
            </div>
            <button
              onClick={() => removeFood(f.id)}
              style={{
                background: "transparent",
                color: "#a18cd1",
                border: "1px solid #a18cd1",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
