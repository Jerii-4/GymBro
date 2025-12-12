import React, { useMemo, useState } from "react";
import { Exercise, ExerciseSet, Session } from "../types";
import { RestTimer } from "./RestTimer";
import { useLocalStore } from "../hooks/useLocalStore";

const uuid = () => crypto.randomUUID();

type Props = {
  onCreated?: (session: Session) => void;
};

export const SessionForm: React.FC<Props> = ({ onCreated }) => {
  const markSession = useLocalStore((s) => s.markSession);
  const upsertGoals = useLocalStore((s) => s.upsertGoals);
  const [dayLabel, setDayLabel] = useState("Push Day");
  const [bodyWeightKg, setBodyWeightKg] = useState<number | undefined>();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: uuid(),
        name: `Exercise ${prev.length + 1}`,
        restSeconds: 90,
        sets: [{ reps: 8 }]
      }
    ]);
  };

  const updateExercise = (id: string, updater: (ex: Exercise) => Exercise) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? updater(ex) : ex)));
  };

  const totalSets = useMemo(
    () => exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
    [exercises]
  );

  const handleSubmit = () => {
    if (!dayLabel.trim()) return;
    const session: Session = {
      id: uuid(),
      dayLabel,
      bodyWeightKg,
      performedAt: new Date().toISOString(),
      exercises
    };
    markSession(session);
    if (bodyWeightKg) {
      const proteinTarget = bodyWeightKg * 2;
      const calorieTarget = Math.round(bodyWeightKg * 33);
      upsertGoals({
        proteinTarget,
        calorieTarget,
        phase: "maintenance"
      });
    }
    onCreated?.(session);
    setExercises([]);
  };

  return (
    <div className="card">
      <h2>New Session</h2>
      <label>Day title (push / pull / legs / custom)</label>
      <input value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} />

      <label>Body weight (kg)</label>
      <input
        type="number"
        value={bodyWeightKg ?? ""}
        onChange={(e) => setBodyWeightKg(Number(e.target.value))}
        placeholder="Ex: 78"
      />

      <div className="chips">
        <span className="pill">Exercises: {exercises.length}</span>
        <span className="pill">Sets: {totalSets}</span>
      </div>

      <div className="list" style={{ marginTop: 10 }}>
        {exercises.map((ex) => (
          <div key={ex.id} className="list-item" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <input
                value={ex.name}
                onChange={(e) =>
                  updateExercise(ex.id, (prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Exercise name"
              />
              <label>Rest timer (seconds)</label>
              <input
                type="number"
                value={ex.restSeconds ?? 0}
                onChange={(e) =>
                  updateExercise(ex.id, (prev) => ({
                    ...prev,
                    restSeconds: Number(e.target.value)
                  }))
                }
              />
              <RestTimer seconds={ex.restSeconds ?? 0} />
              <div className="list" style={{ marginTop: 10 }}>
                {ex.sets.map((set, idx) => (
                  <div key={idx} className="list-item">
                    <span>Set {idx + 1}</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateExercise(ex.id, (prev) => {
                          const nextSets: ExerciseSet[] = prev.sets.map((s, sIdx) =>
                            sIdx === idx ? { ...s, reps: Number(e.target.value) } : s
                          );
                          return { ...prev, sets: nextSets };
                        })
                      }
                      style={{ maxWidth: 80 }}
                      placeholder="Reps"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateExercise(ex.id, (prev) => ({
                      ...prev,
                      sets: [...prev.sets, { reps: 8 }]
                    }))
                  }
                >
                  Add set
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={addExercise}>Add exercise</button>
        <button onClick={handleSubmit} disabled={!dayLabel}>
          Save session & mark attendance
        </button>
      </div>
    </div>
  );
};

