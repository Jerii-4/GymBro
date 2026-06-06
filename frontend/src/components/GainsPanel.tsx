import React, { useMemo, useState } from "react";
import { Measurement } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

type Props = {
  measurements: Measurement[];
  onAdd: (measurement: Measurement) => void;
};

interface FormState {
  heightCm: number | "";
  weightKg: number | "";
  waistCm: number | "";
  chestCm: number | "";
  bicepsCm: number | "";
  forearmCm: number | "";
  thighsCm: number | "";
  calvesCm: number | "";
}

const estimateBodyFat = (weightKg?: number, heightCm?: number, waistCm?: number) => {
  if (!weightKg || !heightCm) return undefined;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const waistAdj = waistCm ? (waistCm - 80) * 0.12 : 0;
  return Math.max(5, Math.min(45, Math.round((1.2 * bmi + waistAdj - 5) * 10) / 10));
};

export const GainsPanel: React.FC<Props> = ({ measurements, onAdd }) => {
  const latest = measurements[0];
  const weightUnit = useLocalStore((s) => s.weightUnit);
  const setWeightUnit = useLocalStore((s) => s.setWeightUnit);

  const [lengthUnit, setLengthUnitState] = useState<"cm" | "in">(() => {
    const saved = localStorage.getItem("lengthUnit");
    return (saved === "cm" || saved === "in") ? saved : "cm";
  });

  const setLengthUnit = (unit: "cm" | "in") => {
    setLengthUnitState(unit);
    localStorage.setItem("lengthUnit", unit);
  };

  const [form, setForm] = useState<FormState>({
    heightCm: "",
    weightKg: "",
    waistCm: "",
    chestCm: "",
    bicepsCm: "",
    forearmCm: "",
    thighsCm: "",
    calvesCm: ""
  });

  const [showWarning, setShowWarning] = useState(false);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const bodyFatPct = useMemo(() => {
    const tempWeightKg = form.weightKg !== ""
      ? weightUnit === "lbs"
        ? Math.round((form.weightKg / 2.20462) * 10) / 10
        : form.weightKg
      : undefined;

    const tempHeightCm = form.heightCm !== ""
      ? lengthUnit === "in"
        ? Math.round((form.heightCm * 2.54) * 10) / 10
        : form.heightCm
      : undefined;

    const tempWaistCm = form.waistCm !== ""
      ? lengthUnit === "in"
        ? Math.round((form.waistCm * 2.54) * 10) / 10
        : form.waistCm
      : undefined;

    return estimateBodyFat(tempWeightKg, tempHeightCm, tempWaistCm);
  }, [form.heightCm, form.weightKg, form.waistCm, weightUnit, lengthUnit]);

  const handleLengthUnitToggle = (newUnit: "cm" | "in") => {
    if (newUnit === lengthUnit) return;
    setForm((prev) => {
      const next = { ...prev };
      const keys: Array<keyof FormState> = [
        "heightCm",
        "waistCm",
        "chestCm",
        "bicepsCm",
        "forearmCm",
        "thighsCm",
        "calvesCm"
      ];
      keys.forEach((key) => {
        const val = prev[key];
        if (val !== "") {
          if (newUnit === "in") {
            next[key] = Math.round((Number(val) / 2.54) * 10) / 10;
          } else {
            next[key] = Math.round((Number(val) * 2.54) * 10) / 10;
          }
        }
      });
      return next;
    });
    setLengthUnit(newUnit);
  };

  const handleWeightUnitToggle = (newUnit: "kg" | "lbs") => {
    if (newUnit === weightUnit) return;
    setForm((prev) => {
      const next = { ...prev };
      const val = prev.weightKg;
      if (val !== "") {
        if (newUnit === "lbs") {
          next.weightKg = Math.round(Number(val) * 2.20462);
        } else {
          next.weightKg = Math.round((Number(val) / 2.20462) * 10) / 10;
        }
      }
      return next;
    });
    setWeightUnit(newUnit);
  };

  const displayLength = (cm?: number) => {
    if (cm === undefined || cm === null) return "—";
    if (lengthUnit === "in") {
      return `${(cm / 2.54).toFixed(1)} in`;
    }
    return `${cm} cm`;
  };

  const displayWeight = (kg?: number) => {
    if (kg === undefined || kg === null) return "—";
    if (weightUnit === "lbs") {
      return `${Math.round(kg * 2.20462)} lbs`;
    }
    return `${kg} kg`;
  };

  const update = (key: keyof FormState, value: number | "") => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setShowWarning(false);
  };

  const handleSubmit = () => {
    const isInvalid =
      form.heightCm === "" ||
      form.weightKg === "" ||
      form.waistCm === "" ||
      form.chestCm === "" ||
      form.bicepsCm === "" ||
      form.forearmCm === "" ||
      form.thighsCm === "" ||
      form.calvesCm === "";

    if (isInvalid) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);

    // Convert length to cm
    const heightCm = lengthUnit === "in" ? Math.round((Number(form.heightCm) * 2.54) * 10) / 10 : Number(form.heightCm);
    const waistCm = lengthUnit === "in" ? Math.round((Number(form.waistCm) * 2.54) * 10) / 10 : Number(form.waistCm);
    const chestCm = lengthUnit === "in" ? Math.round((Number(form.chestCm) * 2.54) * 10) / 10 : Number(form.chestCm);
    const bicepsCm = lengthUnit === "in" ? Math.round((Number(form.bicepsCm) * 2.54) * 10) / 10 : Number(form.bicepsCm);
    const forearmCm = lengthUnit === "in" ? Math.round((Number(form.forearmCm) * 2.54) * 10) / 10 : Number(form.forearmCm);
    const thighsCm = lengthUnit === "in" ? Math.round((Number(form.thighsCm) * 2.54) * 10) / 10 : Number(form.thighsCm);
    const calvesCm = lengthUnit === "in" ? Math.round((Number(form.calvesCm) * 2.54) * 10) / 10 : Number(form.calvesCm);

    // Convert weight to kg
    const weightKg = weightUnit === "lbs" ? Math.round((Number(form.weightKg) / 2.20462) * 10) / 10 : Number(form.weightKg);

    const measurement: Measurement = {
      date: new Date().toISOString(),
      heightCm,
      weightKg,
      waistCm,
      chestCm,
      bicepsCm,
      forearmCm,
      thighsCm,
      calvesCm,
      bodyFatPct
    };

    onAdd(measurement);

    // Reset Form
    setForm({
      heightCm: "",
      weightKg: "",
      waistCm: "",
      chestCm: "",
      bicepsCm: "",
      forearmCm: "",
      thighsCm: "",
      calvesCm: ""
    });
  };

  return (
    <div className="card scrollable-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header with Title and Unit Toggles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/assets/gain.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          <h2 style={{ margin: 0 }}>Gains Tracker</h2>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Weight Toggle */}
          <div style={{ display: "flex", background: "#10131a", borderRadius: "8px", padding: "2px", border: "1px solid #1f2430" }}>
            <button
              type="button"
              onClick={() => handleWeightUnitToggle("kg")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                background: weightUnit === "kg" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: weightUnit === "kg" ? "#00f2fe" : "#7a8190",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => handleWeightUnitToggle("lbs")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                background: weightUnit === "lbs" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: weightUnit === "lbs" ? "#00f2fe" : "#7a8190",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              lbs
            </button>
          </div>

          {/* Length Toggle */}
          <div style={{ display: "flex", background: "#10131a", borderRadius: "8px", padding: "2px", border: "1px solid #1f2430" }}>
            <button
              type="button"
              onClick={() => handleLengthUnitToggle("cm")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                background: lengthUnit === "cm" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: lengthUnit === "cm" ? "#00f2fe" : "#7a8190",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => handleLengthUnitToggle("in")}
              style={{
                padding: "4px 8px",
                fontSize: "0.75rem",
                background: lengthUnit === "in" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: lengthUnit === "in" ? "#00f2fe" : "#7a8190",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              in
            </button>
          </div>
        </div>
      </div>

      {/* Latest Highlight */}
      {latest ? (
        <div className="pill" style={{ fontSize: "0.85rem", padding: "8px 12px", background: "rgba(161, 140, 209, 0.08)", color: "#a18cd1", border: "1px solid rgba(161, 140, 209, 0.15)", borderRadius: "6px" }}>
          Latest summary: Ht: {displayLength(latest.heightCm)} | Wt: {displayWeight(latest.weightKg)} | Body fat: {latest.bodyFatPct ?? "?"}%
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>Add your first measurement to start tracking gains.</p>
      )}

      {/* Measurement Input Form Grid */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Height ({lengthUnit})</label>
          <input
            type="number"
            value={form.heightCm}
            onChange={(e) => update("heightCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 180" : "Ex: 70.8"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Weight ({weightUnit})</label>
          <input
            type="number"
            value={form.weightKg}
            onChange={(e) => update("weightKg", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={weightUnit === "kg" ? "Ex: 80" : "Ex: 176.4"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Waist ({lengthUnit})</label>
          <input
            type="number"
            value={form.waistCm}
            onChange={(e) => update("waistCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 85" : "Ex: 33.4"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Chest ({lengthUnit})</label>
          <input
            type="number"
            value={form.chestCm}
            onChange={(e) => update("chestCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 102" : "Ex: 40.1"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Biceps ({lengthUnit})</label>
          <input
            type="number"
            value={form.bicepsCm}
            onChange={(e) => update("bicepsCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 38" : "Ex: 14.9"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Forearms ({lengthUnit})</label>
          <input
            type="number"
            value={form.forearmCm}
            onChange={(e) => update("forearmCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 30" : "Ex: 11.8"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Thighs ({lengthUnit})</label>
          <input
            type="number"
            value={form.thighsCm}
            onChange={(e) => update("thighsCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 58" : "Ex: 22.8"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#a0a5b5", marginBottom: "4px", display: "block" }}>Calves ({lengthUnit})</label>
          <input
            type="number"
            value={form.calvesCm}
            onChange={(e) => update("calvesCm", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={lengthUnit === "cm" ? "Ex: 38" : "Ex: 14.9"}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", background: "#10131a", border: "1px solid #1f2430", color: "#e9ecf5" }}
          />
        </div>
      </div>

      {/* Body Fat Estimation Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#10131a", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1f2430" }}>
        <span style={{ fontSize: "0.85rem", color: "#a0a5b5" }}>Estimated Body Fat:</span>
        <strong style={{ fontSize: "0.95rem", color: "#00f2fe" }}>
          {bodyFatPct ? `${bodyFatPct}%` : "—"}
        </strong>
      </div>

      {/* Validation Warning */}
      {showWarning && (
        <div style={{ color: "#a18cd1", fontSize: "0.85rem", fontWeight: "600", textAlign: "center" }}>
          ⚠️ All fields are mandatory. Please fill in all measurements.
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: "transparent",
          color: "#a18cd1",
          border: "1px solid #a18cd1",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        Save measurement
      </button>

      {/* Measurement History Section */}
      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "16px", marginTop: "8px" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#e9ecf5", fontSize: "1rem" }}>Measurement History</h3>
        {measurements.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>No measurements recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {measurements.map((m) => {
              const formattedDate = new Date(m.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              });
              const isExpanded = expandedDate === m.date;

              return (
                <div
                  key={m.date}
                  style={{
                    background: "#161922",
                    border: "1px solid #1f2430",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => setExpandedDate(isExpanded ? null : m.date)}
                >
                  {/* Collapsed Header */}
                  <div
                    style={{
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isExpanded ? "rgba(161, 140, 209, 0.05)" : "transparent",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#e9ecf5" }}>
                        {formattedDate}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#a0a5b5", marginTop: "4px" }}>
                        Ht: {displayLength(m.heightCm)} | Wt: {displayWeight(m.weightKg)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="pill" style={{ background: "rgba(0, 242, 254, 0.1)", color: "#00f2fe", fontSize: "0.75rem", fontWeight: "bold", padding: "4px 8px", borderRadius: "4px" }}>
                        Fat: {m.bodyFatPct ? `${m.bodyFatPct}%` : "—"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#7a8190", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded Body Details */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "12px",
                        borderTop: "1px solid #1f2430",
                        background: "#0f121a",
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "8px",
                        fontSize: "0.8rem",
                        color: "#a0a5b5"
                      }}
                    >
                      <div>Waist: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.waistCm)}</strong></div>
                      <div>Chest: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.chestCm)}</strong></div>
                      <div>Biceps: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.bicepsCm)}</strong></div>
                      <div>Forearms: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.forearmCm)}</strong></div>
                      <div>Thighs: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.thighsCm)}</strong></div>
                      <div>Calves: <strong style={{ color: "#e9ecf5" }}>{displayLength(m.calvesCm)}</strong></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
