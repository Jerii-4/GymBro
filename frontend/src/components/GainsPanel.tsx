import React, { useMemo, useState } from "react";
import { Measurement } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

type Props = {
  measurements: Measurement[];
  onAdd: (measurement: Measurement) => void;
};

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

  const [form, setForm] = useState<Measurement>({
    date: new Date().toISOString()
  });

  const bodyFatPct = useMemo(() => {
    const tempWeightKg = form.weightKg !== undefined
      ? weightUnit === "lbs"
        ? Math.round((form.weightKg / 2.20462) * 10) / 10
        : form.weightKg
      : undefined;
    return estimateBodyFat(tempWeightKg, form.heightCm, form.waistCm);
  }, [form.heightCm, form.weightKg, form.waistCm, weightUnit]);

  const formatWeight = (kg?: number) => {
    if (!kg) return "?";
    if (weightUnit === "lbs") {
      return `${Math.round(kg * 2.20462)} lbs`;
    }
    return `${kg} kg`;
  };

  const handleSubmit = () => {
    const finalWeightKg = form.weightKg !== undefined
      ? weightUnit === "lbs"
        ? Math.round((form.weightKg / 2.20462) * 10) / 10
        : form.weightKg
      : undefined;

    const measurement: Measurement = {
      ...form,
      weightKg: finalWeightKg,
      bodyFatPct,
      date: new Date().toISOString()
    };
    onAdd(measurement);
  };

  const update = (key: keyof Measurement, value?: number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="card scrollable-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <img src="/gain.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
        <h2 style={{ margin: 0 }}>Gains Tracker</h2>
      </div>
      {latest ? (
        <div className="pill" style={{ marginBottom: 10 }}>
          Latest: {formatWeight(latest.weightKg)} | Body fat: {latest.bodyFatPct ?? "?"}%
        </div>
      ) : (
        <p className="muted">Add your first measurement.</p>
      )}

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div>
          <label>Height (cm)</label>
          <input
            type="number"
            value={form.heightCm ?? ""}
            onChange={(e) => update("heightCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Weight ({weightUnit})</label>
          <input
            type="number"
            value={form.weightKg ?? ""}
            onChange={(e) => update("weightKg", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Waist (cm)</label>
          <input
            type="number"
            value={form.waistCm ?? ""}
            onChange={(e) => update("waistCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Chest (cm)</label>
          <input
            type="number"
            value={form.chestCm ?? ""}
            onChange={(e) => update("chestCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Biceps (cm)</label>
          <input
            type="number"
            value={form.bicepsCm ?? ""}
            onChange={(e) => update("bicepsCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Forearms (cm)</label>
          <input
            type="number"
            value={form.forearmCm ?? ""}
            onChange={(e) => update("forearmCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Thighs (cm)</label>
          <input
            type="number"
            value={form.thighsCm ?? ""}
            onChange={(e) => update("thighsCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div>
          <label>Calves (cm)</label>
          <input
            type="number"
            value={form.calvesCm ?? ""}
            onChange={(e) => update("calvesCm", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="pill" style={{ margin: "10px 0" }}>
        Estimated body fat: {bodyFatPct ? `${bodyFatPct}%` : "?"}
      </div>

      <button onClick={handleSubmit}>Save measurement</button>
    </div>
  );
};

