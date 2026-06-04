import React, { useMemo, useState, useEffect, useRef } from "react";
import { Exercise, ExerciseSet, Session } from "../types";
import { RestTimer } from "./RestTimer";
import { useLocalStore } from "../hooks/useLocalStore";

const uuid = () => crypto.randomUUID();

type Props = {
  onCreated?: (session: Session) => void;
};


type SetRestTimerProps = {
  defaultTarget: number;
  onSaveRest: (actualSeconds: number) => void;
  savedRest?: number;
  onClearRest: () => void;
};

const SetRestTimer: React.FC<SetRestTimerProps> = ({
  defaultTarget,
  onSaveRest,
  savedRest,
  onClearRest,
}) => {
  const [target, setTarget] = useState(defaultTarget || 90);
  const [remaining, setRemaining] = useState(target);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number>();

  useEffect(() => {
    if (defaultTarget) {
      setTarget(defaultTarget);
      if (!running) {
        setRemaining(defaultTarget);
      }
    }
  }, [defaultTarget, running]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          onSaveRest(target);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Rest over", { body: "Time to lift again." });
          }
          return 0;
        }
        return prev - 1;
      });
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, target, onSaveRest]);

  const handleStartStop = () => {
    if (running) {
      clearInterval(timerRef.current);
      setRunning(false);
      onSaveRest(elapsed);
    } else {
      setElapsed(0);
      setRemaining(target);
      setRunning(true);
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setElapsed(0);
    setRemaining(target);
  };

  if (savedRest !== undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#a18cd1", marginTop: "4px" }}>
        <span>⏱️ Rest taken: <strong>{savedRest}s</strong></span>
        <button
          type="button"
          onClick={onClearRest}
          style={{
            padding: "2px 6px",
            fontSize: "0.7rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "0.8rem", color: "#7a8190" }}>Rest Timer:</span>
      <input
        type="number"
        value={target}
        onChange={(e) => {
          const val = Number(e.target.value) || 0;
          setTarget(val);
          setRemaining(val);
        }}
        placeholder="90"
        style={{ width: "55px", padding: "2px 4px", fontSize: "0.75rem", margin: 0 }}
        disabled={running}
      />
      <span style={{ fontSize: "0.8rem", color: "#00f2fe", minWidth: "30px", fontWeight: "bold" }}>
        {running ? `${remaining}s` : `${target}s`}
      </span>
      <button
        type="button"
        onClick={handleStartStop}
        style={{
          padding: "2px 8px",
          fontSize: "0.75rem",
          background: running ? "rgba(161, 140, 209, 0.1)" : "rgba(0, 242, 254, 0.1)",
          color: running ? "#a18cd1" : "#00f2fe",
          border: running ? "1px solid #a18cd1" : "1px solid #00f2fe",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {running ? "Stop & Save" : "Start Rest"}
      </button>
      {running && (
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "2px 8px",
            fontSize: "0.75rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export const SessionForm: React.FC<Props> = ({ onCreated }) => {
  const markSession = useLocalStore((s) => s.markSession);
  const upsertGoals = useLocalStore((s) => s.upsertGoals);
  const weightUnit = useLocalStore((s) => s.weightUnit);
  const setWeightUnit = useLocalStore((s) => s.setWeightUnit);

  const [dayLabel, setDayLabel] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [showBwWarning, setShowBwWarning] = useState(false);
  const [bodyWeightKg, setBodyWeightKg] = useState<number | "">("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const dropdownOptions = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Upper Body",
    "Lower Body",
    "Full Body",
    "Cardio",
    "Rest Day",
    "Custom"
  ];

  const updateDayLabel = (val: string) => {
    setDayLabel(val);
    if (val.trim()) {
      setShowNameWarning(false);
    }
  };

  const addExercise = () => {
    if (!dayLabel.trim()) {
      setShowNameWarning(true);
      return;
    }
    setShowNameWarning(false);
    setExercises((prev) => [
      ...prev,
      {
        id: uuid(),
        name: "",
        restSeconds: 90,
        sets: [{ reps: 8, mode: "reps" }]
      }
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: string, updater: (ex: Exercise) => Exercise) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? updater(ex) : ex)));
  };

  const removeSet = (exerciseId: string, setIdx: number) => {
    updateExercise(exerciseId, (prev) => ({
      ...prev,
      sets: prev.sets.filter((_, idx) => idx !== setIdx)
    }));
  };

  const totalSets = useMemo(
    () => exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
    [exercises]
  );

  const isRestDay = dayLabel.trim() === "Rest Day";

  const handleSubmit = () => {
    if (!dayLabel.trim()) return;

    if (!isRestDay && bodyWeightKg === "") {
      setShowBwWarning(true);
      return;
    }
    setShowBwWarning(false);

    const finalBodyWeightKg = isRestDay || bodyWeightKg === "" 
      ? undefined 
      : weightUnit === "lbs"
        ? Math.round((Number(bodyWeightKg) / 2.20462) * 100) / 100
        : Number(bodyWeightKg);

    const session: Session = {
      id: uuid(),
      dayLabel,
      bodyWeightKg: finalBodyWeightKg,
      performedAt: new Date().toISOString(),
      exercises: isRestDay
        ? []
        : exercises.map((ex) => ({
          ...ex,
          restSeconds: ex.restSeconds === ("" as any) ? undefined : Number(ex.restSeconds),
          sets: ex.sets.map((s) => ({
            reps: Number(s.reps) || 0,
            weight: s.weight !== undefined 
              ? weightUnit === "lbs"
                ? Math.round((Number(s.weight) / 2.20462) * 100) / 100
                : Number(s.weight)
              : undefined,
            mode: s.mode
          }))
        }))
    };
    markSession(session);
    if (!isRestDay && finalBodyWeightKg !== undefined) {
      const wtNum = finalBodyWeightKg;
      const proteinTarget = wtNum * 2;
      const calorieTarget = Math.round(wtNum * 33);
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
    <div className="card scrollable-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <img src="/exercise.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
        <h2 style={{ margin: 0 }}>New Session</h2>
      </div>

      <div style={{ position: "relative" }}>
        <input
          value={dayLabel}
          onChange={(e) => updateDayLabel(e.target.value)}
          onFocus={() => {
            if (!isCustom && exercises.length === 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={isCustom ? "Enter custom workout (e.g. Abs & Core)" : "Select workout (e.g. Push Day)"}
          readOnly={!isCustom}
          disabled={exercises.length > 0}
          style={{ 
            paddingRight: (isCustom && exercises.length === 0) ? "80px" : "12px",
            opacity: exercises.length > 0 ? 0.6 : 1,
            cursor: exercises.length > 0 ? "not-allowed" : "text"
          }}
        />
        {isCustom && exercises.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              updateDayLabel("");
              setShowDropdown(true);
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#1f2430",
              color: "#00f2fe",
              border: "1px solid #00f2fe",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Presets
          </button>
        )}
        {showDropdown && (
          <>
            <div
              onClick={() => setShowDropdown(false)}
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 99,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#10131a",
                border: "1px solid #1f2430",
                borderRadius: "12px",
                marginTop: "4px",
                zIndex: 100,
                maxHeight: "200px",
                overflowY: "auto",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              {dropdownOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    if (opt === "Custom") {
                      updateDayLabel("");
                      setIsCustom(true);
                    } else {
                      updateDayLabel(opt);
                      setIsCustom(false);
                    }
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #161b26",
                    color: "#e9ecf5",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2430";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showNameWarning && (
        <div style={{ color: "#a18cd1", fontSize: "0.85rem", marginTop: "8px", fontWeight: "600" }}>
          ⚠️ Please select or enter a workout name before adding exercises.
        </div>
      )}

      {!isRestDay && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, marginTop: 12 }}>
            <label style={{ margin: 0 }}>Body weight ({weightUnit})</label>
            <div style={{ display: "flex", background: "#10131a", borderRadius: "8px", padding: "2px", border: "1px solid #1f2430" }}>
              <button
                type="button"
                onClick={() => setWeightUnit("kg")}
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
                onClick={() => setWeightUnit("lbs")}
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
          </div>
          <input
            type="number"
            value={bodyWeightKg}
            onChange={(e) => {
              const val = e.target.value;
              setBodyWeightKg(val === "" ? "" : Number(val));
              if (val !== "") {
                setShowBwWarning(false);
              }
            }}
            placeholder={weightUnit === "kg" ? "Ex: 78" : "Ex: 172"}
          />
          {showBwWarning && (
            <div style={{ color: "#a18cd1", fontSize: "0.85rem", marginTop: "8px", fontWeight: "600" }}>
              ⚠️ Please enter your body weight before saving the session.
            </div>
          )}

          <div className="chips">
            <span className="pill">Exercises: {exercises.length}</span>
            <span className="pill">Sets: {totalSets}</span>
          </div>

          <div className="list" style={{ marginTop: 10 }}>
            {exercises.map((ex) => (
              <div key={ex.id} className="list-item" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <input
                      value={ex.name}
                      onChange={(e) =>
                        updateExercise(ex.id, (prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter exercise name (e.g., Bench Press)"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(ex.id)}
                      style={{
                        background: "transparent",
                        color: "#a18cd1",
                        border: "1px solid #a18cd1",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        transition: "all 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Remove Exercise
                    </button>
                  </div>

                  <label>Default rest target (seconds)</label>
                  <input
                    type="number"
                    value={ex.restSeconds ?? ""}
                    onChange={(e) =>
                      updateExercise(ex.id, (prev) => ({
                        ...prev,
                        restSeconds: e.target.value === "" ? "" as any : Number(e.target.value)
                      }))
                    }
                    placeholder="90"
                  />

                  <div className="list" style={{ marginTop: 10 }}>
                    {ex.sets.map((set, idx) => (
                      <div key={idx} className="list-item" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px", border: "1px solid #1f2430", borderRadius: "8px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>Set: {idx + 1}</strong>
                          <button
                            type="button"
                            onClick={() => removeSet(ex.id, idx)}
                            style={{
                              background: "transparent",
                              color: "#a18cd1",
                              border: "1px solid #a18cd1",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              marginLeft: "8px",
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

                        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                          {/* Set Mode Selection */}
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: "0.8rem", color: "#a0a5b5" }}>Track by:</span>
                            <div style={{ display: "flex", background: "#10131a", borderRadius: "8px", padding: "2px", border: "1px solid #1f2430" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  updateExercise(ex.id, (prev) => {
                                    const nextSets = prev.sets.map((s, sIdx) =>
                                      sIdx === idx ? { ...s, mode: "reps" as const, reps: 8 } : s
                                    );
                                    return { ...prev, sets: nextSets };
                                  });
                                }}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "0.75rem",
                                  background: set.mode !== "time" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                                  color: set.mode !== "time" ? "#00f2fe" : "#7a8190",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                Reps
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateExercise(ex.id, (prev) => {
                                    const nextSets = prev.sets.map((s, sIdx) =>
                                      sIdx === idx ? { ...s, mode: "time" as const, reps: 60 } : s
                                    );
                                    return { ...prev, sets: nextSets };
                                  });
                                }}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "0.75rem",
                                  background: set.mode === "time" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                                  color: set.mode === "time" ? "#00f2fe" : "#7a8190",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                Time
                              </button>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            {/* Input field */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="number"
                                value={set.reps ?? ""}
                                onChange={(e) =>
                                  updateExercise(ex.id, (prev) => {
                                    const nextSets: ExerciseSet[] = prev.sets.map((s, sIdx) =>
                                      sIdx === idx ? { ...s, reps: e.target.value === "" ? "" as any : Number(e.target.value) } : s
                                    );
                                    return { ...prev, sets: nextSets };
                                  })
                                }
                                style={{ maxWidth: 80, margin: 0 }}
                                placeholder={set.mode === "time" ? "Secs" : "Reps"}
                              />
                            </div>

                            {/* Weight Input field */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: "0.8rem", color: "#a0a5b5" }}>Weight:</span>
                              <input
                                type="number"
                                value={set.weight ?? ""}
                                onChange={(e) =>
                                  updateExercise(ex.id, (prev) => {
                                    const nextSets = prev.sets.map((s, sIdx) =>
                                      sIdx === idx ? { ...s, weight: e.target.value === "" ? undefined : Number(e.target.value) } : s
                                    );
                                    return { ...prev, sets: nextSets };
                                  })
                                }
                                style={{ maxWidth: 80, margin: 0 }}
                                placeholder={weightUnit}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Rest Timer at set level */}
                        <SetRestTimer
                          defaultTarget={ex.restSeconds ?? 90}
                          savedRest={set.restSeconds}
                          onSaveRest={(actualSeconds) => {
                            updateExercise(ex.id, (prev) => {
                              const nextSets = prev.sets.map((s, sIdx) =>
                                sIdx === idx ? { ...s, restSeconds: actualSeconds } : s
                              );
                              return { ...prev, sets: nextSets };
                            });
                          }}
                          onClearRest={() => {
                            updateExercise(ex.id, (prev) => {
                              const nextSets = prev.sets.map((s, sIdx) =>
                                sIdx === idx ? { ...s, restSeconds: undefined } : s
                              );
                              return { ...prev, sets: nextSets };
                            });
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        updateExercise(ex.id, (prev) => {
                          const lastSet = prev.sets[prev.sets.length - 1];
                          const defaultMode = lastSet?.mode ?? "reps";
                          const defaultReps = defaultMode === "time" ? 60 : 8;
                          return {
                            ...prev,
                            sets: [...prev.sets, { reps: defaultReps, mode: defaultMode }]
                          };
                        })
                      }
                    >
                      Add set
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {!isRestDay && (
          <button 
            onClick={addExercise}
            style={{
              opacity: !dayLabel.trim() ? 0.5 : 1,
              cursor: !dayLabel.trim() ? "not-allowed" : "pointer",
            }}
          >
            Add exercise
          </button>
        )}
        <button onClick={handleSubmit} disabled={!dayLabel}>
          {isRestDay ? "Mark Rest Day Attendance" : "Save session & mark attendance"}
        </button>
      </div>
    </div>
  );
};
