import React, { useEffect } from "react";
import { AttendanceHeatmap } from "./components/AttendanceHeatmap";
import { SessionForm } from "./components/SessionForm";
import { SessionHistory } from "./components/SessionHistory";
import { GainsPanel } from "./components/GainsPanel";
import { NutritionTracker } from "./components/NutritionTracker";
import { MusicPlayer } from "./components/MusicPlayer";
import { useLocalStore, usePersistedEffect } from "./hooks/useLocalStore";
import { Session } from "./types";

const App: React.FC = () => {
  const { sessions, measurements, addMeasurement } = useLocalStore();
  usePersistedEffect();

  const onSessionCreated = (session: Session) => {
    if (session.bodyWeightKg) {
      addMeasurement({
        date: session.performedAt,
        weightKg: session.bodyWeightKg
      });
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Attendance marked", { body: "Session saved and attendance updated." });
    }
  };

  useEffect(() => {
    document.title = "GymBro - Dark Iron";
  }, []);

  return (
    <div className="app-shell">
      <h1 style={{ color: "#e9ecf5", marginBottom: 8 }}>GymBro</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Dark, gym-first tracker with attendance, workouts, gains, nutrition, and music.
      </p>

      <div className="grid" style={{ marginTop: 12 }}>
        <AttendanceHeatmap sessions={sessions} />
        <SessionForm onCreated={onSessionCreated} />
        <SessionHistory sessions={sessions} />
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        <GainsPanel measurements={measurements} onAdd={addMeasurement} />
        <NutritionTracker />
        <MusicPlayer />
      </div>
    </div>
  );
};

export default App;

