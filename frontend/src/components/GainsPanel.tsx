import React, { useMemo, useState } from "react";
import { Measurement } from "../types";

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
  const [form, setForm] = useState<Measurement>({
    date: new Date().toISOString()
  });

  const bodyFatPct = useMemo(
    () => estimateBodyFat(form.weightKg, form.heightCm, form.waistCm),
    [form.heightCm, form.weightKg, form.waistCm]
  );

  const handleSubmit = () => {
    const measurement: Measurement = {
      ...form,
      bodyFatPct,
      date: new Date().toISOString()
    };
    onAdd(measurement);
  };

  const update = (key: keyof Measurement, value?: number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="card">
      <h2>Gains Tracker</h2>
      {latest ? (
        <div className="pill" style={{ marginBottom: 10 }}>
          Latest: {latest.weightKg ?? "?"} kg | Body fat: {latest.bodyFatPct ?? "?"}%
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
            onChange={(e) => update("heightCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Weight (kg)</label>
          <input
            type="number"
            value={form.weightKg ?? ""}
            onChange={(e) => update("weightKg", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Waist (cm)</label>
          <input
            type="number"
            value={form.waistCm ?? ""}
            onChange={(e) => update("waistCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Chest (cm)</label>
          <input
            type="number"
            value={form.chestCm ?? ""}
            onChange={(e) => update("chestCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Biceps (cm)</label>
          <input
            type="number"
            value={form.bicepsCm ?? ""}
            onChange={(e) => update("bicepsCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Forearms (cm)</label>
          <input
            type="number"
            value={form.forearmCm ?? ""}
            onChange={(e) => update("forearmCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Thighs (cm)</label>
          <input
            type="number"
            value={form.thighsCm ?? ""}
            onChange={(e) => update("thighsCm", Number(e.target.value))}
          />
        </div>
        <div>
          <label>Calves (cm)</label>
          <input
            type="number"
            value={form.calvesCm ?? ""}
            onChange={(e) => update("calvesCm", Number(e.target.value))}
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

