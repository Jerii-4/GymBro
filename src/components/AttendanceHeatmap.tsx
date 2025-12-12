import React, { useMemo } from "react";
import { Session } from "../types";

type Props = {
  sessions: Session[];
};

const daysInRange = (months = 4) => {
  const today = new Date();
  const start = new Date();
  start.setMonth(today.getMonth() - months);
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const AttendanceHeatmap: React.FC<Props> = ({ sessions }) => {
  const presentDays = useMemo(
    () => new Set(sessions.map((s) => s.performedAt.slice(0, 10))),
    [sessions]
  );
  const dates = useMemo(() => daysInRange(), []);

  return (
    <div className="card">
      <h2>Attendance</h2>
      <div className="heatmap">
        {dates.map((d) => (
          <div
            key={d}
            className={`day ${presentDays.has(d) ? "present" : "missed"}`}
            title={`${d} - ${presentDays.has(d) ? "Gym" : "Rest"}`}
          />
        ))}
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Shows last few months similar to GitHub contributions.
      </p>
    </div>
  );
};

