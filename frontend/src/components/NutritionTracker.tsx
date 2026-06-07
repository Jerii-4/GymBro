import React, { useMemo, useState, useEffect } from "react";
import { FoodEntry, NutritionPhase } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

const uuid = () => crypto.randomUUID();

interface FoodOption {
  name: string;
  protein100g: number;
  calories100g: number;
  source: "openfoodfacts" | "wger";
}

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

const calcGoals = (currentWeight: number, phase: NutritionPhase, targetWeight?: number, months?: number) => {
  const protein =
    phase === "bulking" ? currentWeight * 2.2 : phase === "cutting" ? currentWeight * 2 : currentWeight * 1.8;
  const baseCalories = currentWeight * 32;
  
  let dailyCalorieShift = 0;
  if ((phase === "bulking" || phase === "cutting") && targetWeight && months && months > 0) {
    const weightDiff = Math.abs(targetWeight - currentWeight);
    const totalCaloriesToShift = weightDiff * 7700;
    const days = months * 30;
    dailyCalorieShift = totalCaloriesToShift / days;
  } else {
    dailyCalorieShift = phase === "bulking" ? 300 : phase === "cutting" ? 300 : 0;
  }

  const calories = phase === "bulking" ? baseCalories + dailyCalorieShift : phase === "cutting" ? baseCalories - dailyCalorieShift : baseCalories;
  return { proteinTarget: Math.round(protein), calorieTarget: Math.round(calories) };
};

export const NutritionTracker: React.FC = () => {
  const { foods, goals, goalHistory, addFood, removeFood, upsertGoals, deleteGoals, deleteGoalHistory, weightUnit, setWeightUnit, measurements } = useLocalStore();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<NutritionPhase>(goals?.phase ?? "maintenance");
  const [weight, setWeight] = useState<number | "">(goals?.currentWeight ?? 70);
  const [targetWeight, setTargetWeight] = useState<number | "">(goals?.targetWeight ?? "");
  const [months, setMonths] = useState<number | "">(goals?.months ?? "");
  const [name, setName] = useState("");
  const [grams, setGrams] = useState<number | "">(100);
  const [protein, setProtein] = useState<number | "">(0);
  const [calories, setCalories] = useState<number | "">(0);
  const [loading, setLoading] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [editWeightVal, setEditWeightVal] = useState<number | "">("");
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [detectedSource, setDetectedSource] = useState<"manual" | "openfoodfacts" | "wger">("manual");
  const [proteinPer100g, setProteinPer100g] = useState<number>(0);
  const [caloriesPer100g, setCaloriesPer100g] = useState<number>(0);
  const [foodOptions, setFoodOptions] = useState<FoodOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const handleUpdateWeight = () => {
    if (editWeightVal !== "" && goals) {
      const wKg = weightUnit === "lbs" ? Number(editWeightVal) / 2.20462 : Number(editWeightVal);
      
      if (isNaN(wKg) || wKg <= 0) {
        setError("Please enter a valid numeric weight greater than 0.");
        setIsEditingWeight(false);
        return;
      }

      if (goals.phase === "cutting" && goals.targetWeight !== undefined && goals.targetWeight >= wKg) {
        setError("Current weight must be greater than target weight for cutting.");
        setIsEditingWeight(false);
        return;
      }
      if (goals.phase === "bulking" && goals.targetWeight !== undefined && goals.targetWeight <= wKg) {
        setError("Current weight must be less than target weight for bulking.");
        setIsEditingWeight(false);
        return;
      }
      
      const { proteinTarget, calorieTarget } = calcGoals(wKg, goals.phase, goals.targetWeight, goals.months);
      upsertGoals({ ...goals, proteinTarget, calorieTarget, currentWeight: wKg });
    }
    setIsEditingWeight(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const sessionFoods = useMemo(() => {
    return foods;
  }, [foods]);

  const todayFoods = useMemo(
    () => sessionFoods.filter(f => {
      if (f.loggedAt && !f.loggedAt.startsWith(todayStr)) return false;
      if (goals?.createdAt && f.loggedAt) {
        return f.loggedAt >= goals.createdAt;
      }
      return true;
    }),
    [sessionFoods, todayStr, goals]
  );

  const combinedHistory = useMemo(() => {
    const history = [...goalHistory];
    if (goals) {
      history.unshift({
        id: -1,
        ...goals,
        startedAt: goals.createdAt || todayStr,
        endedAt: "Ongoing",
      } as any);
    }
    return history;
  }, [goalHistory, goals, todayStr]);

  const totals = useMemo(
    () => todayFoods.reduce((acc, f) => ({ protein: acc.protein + f.protein, calories: acc.calories + f.calories }), { protein: 0, calories: 0 }),
    [todayFoods]
  );

  const handleGoals = () => {
    setError(null);
    if (weight === "") {
      setError("Please enter your current weight.");
      return;
    }
    if ((phase === "bulking" || phase === "cutting") && (targetWeight === "" || months === "")) {
      setError("Please enter target weight and timeline.");
      return;
    }
    
    const currentWeight = Number(weight);
    const tWeight = phase !== "maintenance" ? Number(targetWeight) : undefined;
    const m = phase !== "maintenance" ? Number(months) : undefined;

    if (isNaN(currentWeight) || currentWeight <= 0) {
      setError("Please enter a valid numeric current weight greater than 0.");
      return;
    }

    if (phase !== "maintenance") {
      if (tWeight === undefined || isNaN(tWeight) || tWeight <= 0) {
        setError("Please enter a valid numeric target weight greater than 0.");
        return;
      }
      if (m === undefined || isNaN(m) || m <= 0) {
        setError("Please enter a valid numeric timeline greater than 0.");
        return;
      }
      if (phase === "cutting" && tWeight >= currentWeight) {
        setError("Target weight must be less than current weight for cutting.");
        return;
      }
      if (phase === "bulking" && tWeight <= currentWeight) {
        setError("Target weight must be greater than current weight for bulking.");
        return;
      }
    }
    
    const weightKg = weightUnit === "lbs" ? currentWeight / 2.20462 : currentWeight;
    const tWeightKg = tWeight !== undefined ? (weightUnit === "lbs" ? tWeight / 2.20462 : tWeight) : undefined;
    
    const { proteinTarget, calorieTarget } = calcGoals(weightKg, phase, tWeightKg, m);
    upsertGoals({ 
      proteinTarget, 
      calorieTarget, 
      phase, 
      currentWeight: weightKg, 
      targetWeight: tWeightKg, 
      months: m,
      createdAt: new Date().toISOString()
    });
  };

  const handleAddFood = (source?: "manual" | "openfoodfacts" | "wger") => {
    if (!name || grams === "" || grams <= 0) return;
    addFood({
      id: uuid(),
      name,
      grams: Number(grams),
      protein: protein === "" ? 0 : Number(protein),
      calories: calories === "" ? 0 : Number(calories),
      source: source ?? detectedSource ?? "manual",
      loggedAt: new Date().toISOString()
    });
    setName("");
    setProtein(0);
    setCalories(0);
    setDetectedSource("manual");
  };

  useEffect(() => {
    if (!name || name.trim().length < 1) {
      setFoodOptions([]);
      setShowOptions(false);
      setProteinPer100g(0);
      setCaloriesPer100g(0);
      setProtein(0);
      setCalories(0);
      setDetectedSource("manual");
      return;
    }

    const hasMatch = foodOptions.some(opt => opt.name === name);
    if (hasMatch) return;

    const timer = setTimeout(() => {
      setLoading(true);
      setFoodOptions([]);

      let activeRequests = 2;
      const decrementRequest = () => {
        activeRequests--;
        if (activeRequests === 0) {
          setLoading(false);
        }
      };

      // 1. Fetch OpenFoodFacts (up to 5 results)
      fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page_size=5`,
        {
          headers: {
            "X-User-Agent": "GymBro - Web - Version 1.0"
          }
        }
      ).then(async res => {
        if (res.ok) {
          const data = await res.json();
          const offResults: FoodOption[] = [];
          (data.products || []).forEach((product: any) => {
            const productName = product.product_name || product.product_name_en || product.product_name_fr || "";
            if (!productName) return;
            const protein100 = Number(product.nutriments?.proteins_100g ?? 0);
            const kcal100 = Number(product.nutriments?.["energy-kcal_100g"] ?? product.nutriments?.energy_value ?? 0);
            offResults.push({
              name: product.brands ? `${productName} (${product.brands})` : productName,
              protein100g: protein100,
              calories100g: kcal100,
              source: "openfoodfacts"
            });
          });

          if (offResults.length > 0) {
            setFoodOptions(prev => {
              const combined = [...prev, ...offResults];
              return combined.filter((item, index, self) =>
                index === self.findIndex((t) => t.name.toLowerCase() === item.name.toLowerCase())
              );
            });
            setShowOptions(true);
          }
        }
      })
      .catch(err => console.error("OFF search failed:", err))
      .finally(decrementRequest);

      // 2. Fetch Wger (up to 5 results)
      fetch(
        `https://wger.de/api/v2/ingredient/?name=${encodeURIComponent(name)}`
      ).then(async res => {
        if (res.ok) {
          const data = await res.json();
          const wgerResults: FoodOption[] = [];
          (data.results || []).slice(0, 5).forEach((ingredient: any) => {
            if (!ingredient.name) return;
            wgerResults.push({
              name: ingredient.name,
              protein100g: Number(ingredient.protein ?? 0),
              calories100g: Number(ingredient.energy ?? 0),
              source: "wger"
            });
          });

          if (wgerResults.length > 0) {
            setFoodOptions(prev => {
              const combined = [...prev, ...wgerResults];
              return combined.filter((item, index, self) =>
                index === self.findIndex((t) => t.name.toLowerCase() === item.name.toLowerCase())
              );
            });
            setShowOptions(true);
          }
        }
      })
      .catch(err => console.error("Wger search failed:", err))
      .finally(decrementRequest);

    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [name]);

  useEffect(() => {
    if (detectedSource !== "manual") {
      const g = grams === "" ? 0 : Number(grams);
      setProtein(Math.round(((proteinPer100g * g) / 100) * 10) / 10);
      setCalories(Math.round(((caloriesPer100g * g) / 100) * 10) / 10);
    }
  }, [grams, proteinPer100g, caloriesPer100g, detectedSource]);

  return (
    <div className="card scrollable-card" style={{ minHeight: "450px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/assets/nutrition.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          <h2 style={{ margin: 0 }}>Protein & Calories</h2>
        </div>
        <button 
          onClick={() => {
            setExpandedHistoryId(null);
            setExpandedDayId(null);
            setDeleteConfirmId(null);
            setShowHistory(true);
          }} 
          style={{ background: "transparent", border: "1px solid #3a4256", color: "#a0a5b5", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          History
        </button>
      </div>
      <div className="nutrition-columns-grid">
        {/* Left Column: Goals and Targets */}
        <div className="nutrition-column-left">
          {goals ? (
            <div style={{ background: "rgba(16, 19, 26, 0.5)", border: "1px solid rgba(31, 36, 48, 0.8)", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, color: "#00f2fe", textTransform: "capitalize" }}>{goals.phase} Session</h3>
                {goals.createdAt && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "0.8rem" }}>
                    <span className="muted">
                      Started: {new Date(goals.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {goals.months && (
                      <span className="muted" style={{ color: "#a18cd1" }}>
                        Goal Date: {(() => {
                          const d = new Date(goals.createdAt!);
                          d.setMonth(d.getMonth() + goals.months);
                          return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                        })()}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {error && (
                <div style={{ background: "rgba(235, 87, 87, 0.1)", border: "1px solid rgba(235, 87, 87, 0.3)", color: "#eb5757", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="muted">Current:</span> 
                  {isEditingWeight ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <input 
                        type="number" 
                        value={editWeightVal} 
                        onChange={(e) => setEditWeightVal(e.target.value === "" ? "" : Number(e.target.value))}
                        style={{ width: "60px", padding: "2px 4px", margin: 0, fontSize: "0.85rem" }}
                      />
                      <button onClick={handleUpdateWeight} style={{ padding: "2px 6px", fontSize: "0.7rem", color: "#00f2fe", borderColor: "#00f2fe" }}>Save</button>
                      <button onClick={() => setIsEditingWeight(false)} style={{ padding: "2px 6px", fontSize: "0.7rem", color: "#eb5757", borderColor: "#eb5757" }}>X</button>
                    </div>
                  ) : (
                    <>
                      <span>{weightUnit === "lbs" ? Math.round(goals.currentWeight! * 2.20462) : goals.currentWeight} {weightUnit}</span>
                      <button 
                        onClick={() => {
                          setEditWeightVal(weightUnit === "lbs" ? Math.round(goals.currentWeight! * 2.20462) : goals.currentWeight!);
                          setIsEditingWeight(true);
                        }}
                        style={{ padding: "2px 6px", fontSize: "0.7rem", background: "transparent", border: "1px solid #3a4256", color: "#a0a5b5" }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
                {goals.phase !== "maintenance" && (
                  <>
                    <div><span className="muted">Target:</span> {weightUnit === "lbs" ? Math.round(goals.targetWeight! * 2.20462) : goals.targetWeight} {weightUnit}</div>
                    <div><span className="muted">Timeline:</span> {goals.months} months</div>
                  </>
                )}
              </div>

              <div className="grid" style={{ marginTop: 8, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", justifyItems: "center" }}>
                <ProgressRing value={totals.protein} target={goals.proteinTarget} label="Protein (g)" />
                <ProgressRing value={totals.calories} target={goals.calorieTarget} label="Calories" />
              </div>
              
              {showEndConfirm ? (
                <div style={{ background: "rgba(235, 87, 87, 0.1)", border: "1px solid rgba(235, 87, 87, 0.3)", borderRadius: "8px", padding: "16px", marginTop: "24px" }}>
                  <p style={{ color: "#eb5757", margin: "0 0 12px", fontSize: "0.9rem", textAlign: "center" }}>Are you sure you want to end this session? It will be securely archived in your History.</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { deleteGoals(); setShowEndConfirm(false); }} style={{ flex: 1, background: "#eb5757", color: "#fff", border: "none" }}>Yes, End Session</button>
                    <button onClick={() => setShowEndConfirm(false)} style={{ flex: 1, background: "transparent", color: "#a0a5b5", border: "1px solid #3a4256" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowEndConfirm(true)} 
                  style={{ width: "100%", marginTop: "24px", borderColor: "#eb5757", color: "#eb5757" }}
                >
                  End Session
                </button>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "rgba(235, 87, 87, 0.1)", border: "1px solid rgba(235, 87, 87, 0.3)", color: "#eb5757", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: "1 1 auto", minWidth: "100px" }}>
                  <label style={{ fontSize: "0.9rem" }}>Phase</label>
                  <select value={phase} onChange={(e) => setPhase(e.target.value as NutritionPhase)} style={{ margin: "4px 0 0" }}>
                    <option value="bulking">Bulking</option>
                    <option value="cutting">Cutting</option>
                    <option value="maintenance">Maintaining</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 auto", minWidth: "100px" }}>
                  <label style={{ fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span>Current ({weightUnit})</span>
                    <button 
                      onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                      style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: "4px", background: "rgba(0, 242, 254, 0.1)", color: "#00f2fe", border: "1px solid rgba(0, 242, 254, 0.3)", cursor: "pointer", marginLeft: "8px" }}
                    >
                      Use {weightUnit === "kg" ? "lbs" : "kg"}
                    </button>
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 70"
                    style={{ margin: "0" }}
                  />
                </div>
                {phase !== "maintenance" && (
                  <>
                    <div style={{ flex: "1 1 auto", minWidth: "100px" }}>
                      <label style={{ fontSize: "0.9rem", display: "inline-block", marginBottom: "4px" }}>Target ({weightUnit})</label>
                      <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 75"
                        style={{ margin: "0" }}
                      />
                    </div>
                    <div style={{ flex: "1 1 auto", minWidth: "80px" }}>
                      <label style={{ fontSize: "0.9rem", display: "inline-block", marginBottom: "4px" }}>Months</label>
                      <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 3"
                        style={{ margin: "0" }}
                      />
                    </div>
                  </>
                )}
                <button onClick={handleGoals} style={{ height: "42px", padding: "0 20px", whiteSpace: "nowrap" }}>
                  Set
                </button>
              </div>
            </>

          )}
        </div>

        <div className="nutrition-column-right">
          <h3 style={{ margin: "0 0 12px" }}>Add food</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>Food name</label>
                {loading && <span style={{ fontSize: "0.7rem", color: "#00f2fe" }}>Searching...</span>}
              </div>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                onFocus={() => { if (foodOptions.length > 0) setShowOptions(true); }}
                placeholder="Chicken breast" 
                style={{ margin: "4px 0 10px", width: "100%" }} 
              />
              {showOptions && (
                <div 
                  onClick={() => setShowOptions(false)} 
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1999, background: "transparent" }} 
                />
              )}
              {showOptions && foodOptions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#1f2430",
                  border: "1px solid #3a4256",
                  borderRadius: "8px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  zIndex: 2000,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  marginTop: "-6px"
                }} className="scrollable-card">
                  {foodOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setName(opt.name);
                        setProteinPer100g(opt.protein100g);
                        setCaloriesPer100g(opt.calories100g);
                        setDetectedSource(opt.source);
                        setShowOptions(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.85rem",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                        <div style={{ fontWeight: "bold", color: "#e9ecf5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opt.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#a0a5b5", marginTop: "2px" }}>
                          {Math.round(opt.protein100g * 10) / 10}g protein · {Math.round(opt.calories100g)} kcal <span style={{ color: "#777" }}>(per 100g)</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        background: opt.source === "openfoodfacts" ? "rgba(0, 242, 254, 0.15)" : "rgba(161, 140, 209, 0.2)",
                        color: opt.source === "openfoodfacts" ? "#00f2fe" : "#a18cd1",
                        textTransform: "uppercase"
                      }}>
                        {opt.source === "openfoodfacts" ? "OFF" : "WGER"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label>Weight (g)</label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="100"
                style={{ margin: "4px 0 10px", width: "100%" }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
            <div>
              <label>Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => {
                  setProtein(e.target.value === "" ? "" : Number(e.target.value));
                  setDetectedSource("manual");
                }}
                placeholder="e.g. 31"
                style={{ margin: "4px 0 10px", width: "100%" }}
              />
            </div>
            <div>
              <label>Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => {
                  setCalories(e.target.value === "" ? "" : Number(e.target.value));
                  setDetectedSource("manual");
                }}
                placeholder="e.g. 165"
                style={{ margin: "4px 0 10px", width: "100%" }}
              />
            </div>
          </div>

          <div className="chips" style={{ marginTop: "16px" }}>
            <button onClick={() => handleAddFood()}>Save Food</button>
          </div>
        </div>
      </div>


      
      {showHistory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#1f2430", padding: "24px", borderRadius: "12px", width: "90%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto", border: "1px solid #3a4256" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0 }}>Goal History</h2>
              <button onClick={() => setShowHistory(false)} style={{ background: "transparent", border: "none", color: "#a0a5b5", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            {combinedHistory.length === 0 ? (
              <p className="muted">No past sessions found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {combinedHistory.map(h => (
                  <div key={h.id} style={{ background: "rgba(16, 19, 26, 0.5)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(31, 36, 48, 0.8)" }}>
                    {/* Clickable Header */}
                    <div 
                      onClick={() => setExpandedHistoryId(expandedHistoryId === h.id ? null : h.id)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "#00f2fe", fontSize: "0.8rem", transform: expandedHistoryId === h.id ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.15s ease" }}>▶</span>
                        <div>
                          <strong style={{ textTransform: "capitalize", color: "#00f2fe", fontSize: "1.05rem" }}>
                            {h.phase} Session {h.id === -1 && "(Active)"}
                          </strong>
                          <div style={{ fontSize: "0.75rem", color: "#a0a5b5", marginTop: "2px" }}>
                            {new Date(h.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} – {h.endedAt === "Ongoing" ? "Ongoing" : new Date(h.endedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {h.id !== -1 && (
                          deleteConfirmId === h.id ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button onClick={() => { deleteGoalHistory(h.id); setDeleteConfirmId(null); }} style={{ padding: "4px 8px", fontSize: "0.75rem", background: "#eb5757", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Confirm</button>
                              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: "4px 8px", fontSize: "0.75rem", background: "transparent", color: "#a0a5b5", border: "1px solid #3a4256", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(h.id)} style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(235, 87, 87, 0.1)", color: "#eb5757", border: "1px solid rgba(235, 87, 87, 0.3)", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Expanded Details and Logs */}
                    {expandedHistoryId === h.id && (
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        {h.phase !== "maintenance" && (
                          <div style={{ fontSize: "0.85rem", color: "#a0a5b5", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                            <span><strong>Target:</strong> {h.targetWeight ? `${weightUnit === "lbs" ? Math.round(h.targetWeight * 2.20462) : h.targetWeight} ${weightUnit}` : "N/A"}</span>
                            <span><strong>Duration:</strong> {h.months || "N/A"} months</span>
                          </div>
                        )}
                        {(() => {
                          const startDay = h.startedAt.slice(0, 10);
                          const endDay = h.endedAt === "Ongoing" ? todayStr : h.endedAt.slice(0, 10);
                          
                          const hFoods = foods.filter(f => {
                            if (!f.loggedAt) return false;
                            if (f.loggedAt < h.startedAt) return false;
                            if (h.endedAt !== "Ongoing" && f.loggedAt > h.endedAt) return false;
                            return true;
                          });
                          const hWeights = measurements.filter(m => m.date >= startDay && m.date <= endDay && m.weightKg);
                          
                          const datesMap: Record<string, { foods: typeof foods, weight?: number }> = {};
                          
                          hFoods.forEach(f => {
                            const d = f.loggedAt!.slice(0, 10);
                            if (!datesMap[d]) datesMap[d] = { foods: [] };
                            datesMap[d].foods.push(f);
                          });

                          hWeights.forEach(m => {
                            if (!datesMap[m.date]) datesMap[m.date] = { foods: [] };
                            datesMap[m.date].weight = m.weightKg;
                          });

                          const sortedDates = Object.keys(datesMap).sort((a, b) => b.localeCompare(a));
                          
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                              {sortedDates.length === 0 ? (
                                <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>No logs recorded during this session.</p>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }} className="scrollable-card">
                                  {sortedDates.map(date => {
                                    const dayData = datesMap[date];
                                    const totalPro = dayData.foods.reduce((acc, f) => acc + f.protein, 0);
                                    const totalCal = dayData.foods.reduce((acc, f) => acc + f.calories, 0);
                                    const isExpanded = expandedDayId === `${h.id}-${date}`;
                                    
                                    return (
                                      <div key={date} style={{ background: "rgba(16, 19, 26, 0.5)", padding: "12px", borderRadius: "8px", border: "1px solid #1f2430" }}>
                                        <div 
                                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                                          onClick={() => setExpandedDayId(isExpanded ? null : `${h.id}-${date}`)}
                                        >
                                          <div>
                                            <h4 style={{ margin: "0 0 4px 0", color: "#a18cd1", fontSize: "0.95rem" }}>
                                              {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                            </h4>
                                            <div style={{ fontSize: "0.8rem", color: "#a0a5b5" }}>
                                              {Math.round(totalPro)}g Protein · {Math.round(totalCal)} Calories
                                            </div>
                                          </div>
                                          
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {dayData.weight && (
                                              <div style={{ background: "rgba(0, 242, 254, 0.1)", padding: "2px 8px", borderRadius: "4px", color: "#00f2fe", fontSize: "0.8rem", fontWeight: "bold" }}>
                                                {weightUnit === "lbs" ? Math.round(dayData.weight * 2.20462) : dayData.weight} {weightUnit}
                                              </div>
                                            )}
                                            <span style={{ color: "#a0a5b5", fontSize: "0.8rem" }}>{isExpanded ? "▲" : "▼"}</span>
                                          </div>
                                        </div>
                                        
                                        {isExpanded && (
                                          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(31, 36, 48, 0.8)" }}>
                                            {dayData.foods.length > 0 ? (
                                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                {dayData.foods.map(f => (
                                                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(31, 36, 48, 0.3)", padding: "8px", borderRadius: "6px" }}>
                                                    <div>
                                                      <strong style={{ fontSize: "0.85rem", color: "#e9ecf5" }}>{f.name}</strong> <span className="muted" style={{ fontSize: "0.75rem" }}>{f.grams} g</span>
                                                      <div className="muted" style={{ fontSize: "0.75rem" }}>{Math.round(f.protein)}g p · {Math.round(f.calories)} kcal</div>
                                                    </div>
                                                    <button onClick={() => removeFood(f.id)} style={{ padding: "4px 8px", fontSize: "0.7rem", background: "rgba(235, 87, 87, 0.1)", color: "#eb5757", border: "1px solid rgba(235, 87, 87, 0.3)", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="muted" style={{ fontSize: "0.8rem", marginTop: "4px" }}>No food logged.</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
