import React, { useState } from "react";
import { Session } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

type Props = {
  sessions: Session[];
};

export const SessionHistory: React.FC<Props> = ({ sessions }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const weightUnit = useLocalStore((s) => s.weightUnit);

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const formatWeight = (kg: number) => {
    if (weightUnit === "lbs") {
      return `${Math.round(kg * 2.20462)} lbs`;
    }
    return `${kg} kg`;
  };

  return (
    <div className="card scrollable-card">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <img src="/assets/exercise.png" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
        <h2 style={{ margin: 0 }}>Previous Sessions</h2>
      </div>
      <div className="list" style={{ marginTop: "12px" }}>
        {sessions.length === 0 && <p className="muted">No history yet.</p>}
        {sessions.map((session) => {
          const isExpanded = expandedSessionId === session.id;
          return (
            <div
              key={session.id}
              onClick={() => toggleExpand(session.id)}
              className="list-item"
              style={{
                flexDirection: "column",
                alignItems: "stretch",
                cursor: "pointer",
                padding: "16px",
                borderRadius: "12px",
                border: isExpanded ? "1px solid rgba(0, 242, 254, 0.4)" : "1px solid #1f2430",
                background: isExpanded ? "#10141f" : "transparent",
                transition: "all 0.2s ease-in-out",
                marginBottom: "8px",
              }}
            >
              {/* Header Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <div>
                  <strong style={{ fontSize: "1.05rem", color: isExpanded ? "#00f2fe" : "#e9ecf5" }}>
                    {session.dayLabel}
                  </strong>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                    {new Date(session.performedAt).toLocaleString()}
                  </div>
                  {session.bodyWeightKg && (
                    <div className="pill" style={{ marginTop: 6, display: "inline-block" }}>
                      BW: {formatWeight(session.bodyWeightKg)}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>{session.exercises.length} exercises</div>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {session.exercises.reduce((acc, e) => acc + e.sets.length, 0)} sets
                  </div>
                  <div style={{ color: "#00f2fe", fontSize: "0.75rem", marginTop: "4px", fontWeight: "bold" }}>
                    {isExpanded ? "▲ Hide Details" : "▼ Show Details"}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px solid #1f2430",
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent clicking inner details from toggling expansion
                >
                  {session.exercises.length === 0 ? (
                    <p className="muted" style={{ margin: 0, fontSize: "0.9rem", fontStyle: "italic" }}>
                      Rest day / No exercises logged.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {session.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id || exIdx}
                          style={{
                            background: "#0c0f16",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #161b26",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "8px" }}>
                            <strong style={{ color: "#e9ecf5" }}>{ex.name}</strong>
                            {ex.restSeconds !== undefined && (
                              <span style={{ fontSize: "0.8rem", color: "#a18cd1" }}>
                                Rest: {ex.restSeconds}s
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                            {ex.sets.map((set, setIdx) => (
                              <div
                                key={setIdx}
                                style={{
                                  background: "#121620",
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                  border: "1px solid #1f2430",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                  <span className="muted" style={{ marginRight: "4px" }}>Set {setIdx + 1}:</span>
                                  <span style={{ color: "#e9ecf5" }}>
                                    {set.weight !== undefined ? formatWeight(set.weight) : "—"}{" "}
                                    ×{" "}
                                    <strong style={{ color: "#00f2fe" }}>
                                      {set.mode === "time" ? `${set.reps}s` : `${set.reps} reps`}
                                    </strong>
                                  </span>
                                </div>
                                {set.restSeconds !== undefined && (
                                  <div style={{ fontSize: "0.75rem", color: "#a18cd1", textAlign: "right", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px", marginTop: "2px" }}>
                                    ⏱️ Rest taken: <strong>{set.restSeconds}s</strong>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
