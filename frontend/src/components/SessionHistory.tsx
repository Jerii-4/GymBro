import React from "react";
import { Session } from "../types";

type Props = {
  sessions: Session[];
};

export const SessionHistory: React.FC<Props> = ({ sessions }) => {
  return (
    <div className="card">
      <h2>Previous Sessions</h2>
      <div className="list">
        {sessions.length === 0 && <p className="muted">No history yet.</p>}
        {sessions.map((session) => (
          <div key={session.id} className="list-item" style={{ alignItems: "flex-start" }}>
            <div>
              <strong>{session.dayLabel}</strong>
              <div className="muted">{new Date(session.performedAt).toLocaleString()}</div>
              {session.bodyWeightKg && (
                <div className="pill" style={{ marginTop: 6 }}>
                  BW: {session.bodyWeightKg} kg
                </div>
              )}
            </div>
            <div>
              <div className="muted">{session.exercises.length} exercises</div>
              <div className="muted">
                {session.exercises.reduce((acc, e) => acc + e.sets.length, 0)} sets
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

