import React, { useEffect, useState } from "react";
import { AttendanceHeatmap } from "./components/AttendanceHeatmap";
import { SessionForm } from "./components/SessionForm";
import { SessionHistory } from "./components/SessionHistory";
import { GainsPanel } from "./components/GainsPanel";
import { NutritionTracker } from "./components/NutritionTracker";
import { Login } from "./components/Login";
import { useLocalStore, usePersistedEffect } from "./hooks/useLocalStore";
import { Session } from "./types";
import Orb from "./components/Orb";


const App: React.FC = () => {
  const { token, username, logout, sessions, measurements, addMeasurement } = useLocalStore();
  const [view, setView] = useState<"landing" | "login" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"workouts" | "attendance" | "gains" | "diet">("workouts");

  usePersistedEffect();

  // Sync view state based on token status (e.g. on mount or login/logout action)
  useEffect(() => {
    if (token) {
      setView("dashboard");
    } else {
      setView("landing");
    }
  }, [token]);

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
    document.title = "GymBro - Personalised fitness companion";
  }, []);

  const handleLogout = () => {
    logout();
  };

  // 1. Show Landing Page View
  if (view === "landing") {
    return (
      <div className="landing-wrapper animate-fade-in-up">
        {/* Background WebGL Orb */}
        <div className="landing-orb-container">
          <Orb
            hoverIntensity={1.5}
            rotateOnHover={true}
            hue={0}
            forceHoverState={false}
          />
        </div>

        {/* Header Bar */}
        <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 32px",
            maxWidth: "1100px",
            margin: "0 auto",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo.png"
              alt="GymBro Logo"
              style={{
                width: "32px",
                height: "32px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "1.5px solid rgba(0, 242, 254, 0.4)",
              }}
            />
            <span style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.5px" }}>
              Gym<span style={{
                color: "#00f2fe",
                background: "linear-gradient(to right, #00f2fe, #a18cd1)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Bro</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (token) {
                setView("dashboard");
              } else {
                setView("login");
              }
            }}
            style={{
              border: "1px solid rgba(0, 242, 254, 0.3)",
              padding: "6px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(161, 140, 209, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
            }}
          >
            <span className="gradient-text">{token ? "Dashboard" : "Login"}</span>
          </button>
        </header>

        {/* Content Wrapper */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            maxHeight: "100vh",
            padding: "80px 24px 24px",
            maxWidth: "1000px",
            margin: "0 auto",
            textAlign: "center",
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        >
          {/* Badge */}
          <div className="landing-badge" style={{ pointerEvents: "auto" }}>
            Your Personal Fitness Companion
          </div>

          {/* Hero Title */}
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              color: "#e9ecf5",
              margin: "0 0 10px",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "20ch",
              pointerEvents: "auto",
            }}
          >
            Forge Your Physique with{" "}
            <span className="gradient-text">
              GymBro
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="muted"
            style={{
              fontSize: "1.05rem",
              maxWidth: "600px",
              margin: "0 0 20px",
              lineHeight: 1.5,
              pointerEvents: "auto",
            }}
          >
            Track your workouts, record your stats, and monitor your nutrition in one seamless experience.
          </p>

          {/* Call to Action Button */}
          <div style={{ pointerEvents: "auto" }}>
            <button
              onClick={() => {
                if (token) {
                  setView("dashboard");
                } else {
                  setView("login");
                }
              }}
              className="cta-button"
            >
              {token ? "Go to Dashboard →" : "Start Working Out →"}
            </button>
          </div>

          {/* Feature Grid */}
          <div
            className="grid"
            style={{
              marginTop: "32px",
              width: "100%",
              gap: "16px",
              gridTemplateColumns: "repeat(3, 1fr)",
              pointerEvents: "auto",
            }}
          >
            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "1.8rem", marginBottom: "8px" }}>
                <span>💪</span>
                <span>🗓️</span>
              </div>
              <h3 className="gradient-text">
                Workout & Attendance
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
                Log exercises, sets, reps, and rest intervals while monitoring your consistency, attendance trends, and training streaks.
              </p>
            </div>

            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📈</div>
              <h3 className="gradient-text">
                Gains Progress
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
                Track weight, body fat %, and tape measurements. Visualise your physical progression over time.
              </p>
            </div>

            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🥗</div>
              <h3 className="gradient-text">
                Smart Diet
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
                Manage target protein and calorie intake customized for bulking, cutting, or maintenance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Show Login View
  if (view === "login") {
    return <Login onBack={() => setView("landing")} />;
  }

  // 3. Show Dashboard View (Authenticated)
  return (
    <div className="dashboard-wrapper">
      <div className="app-shell animate-fade-in-up">
      {/* Header bar with user welcome message and Log Out button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid #1f2430",
          paddingBottom: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ color: "#e9ecf5", margin: 0 }}>GymBro</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Welcome back, <strong className="gradient-text">{username}</strong>!
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setView("landing")}
            style={{
              border: "1px solid rgba(0, 242, 254, 0.3)",
              padding: "8px 16px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(161, 140, 209, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
            }}
          >
            <span className="gradient-text">Home</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#eb5757",
              color: "#ffffff",
              padding: "8px 16px",
              fontSize: "0.9rem",
              boxShadow: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e04b4b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#eb5757";
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0 24px",
          borderBottom: "1px solid #161b26",
          paddingBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          onClick={() => setActiveTab("workouts")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "workouts" ? "linear-gradient(to right, #00f2fe, #a18cd1)" : "transparent",
            WebkitBackgroundClip: activeTab === "workouts" ? "text" : "unset",
            backgroundClip: activeTab === "workouts" ? "text" : "unset",
            WebkitTextFillColor: activeTab === "workouts" ? "transparent" : "unset",
            color: activeTab === "workouts" ? "transparent" : "#7a8190",
            border: activeTab === "workouts" ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          💪 Workouts
        </span>
        <span
          onClick={() => setActiveTab("gains")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "gains" ? "linear-gradient(to right, #00f2fe, #a18cd1)" : "transparent",
            WebkitBackgroundClip: activeTab === "gains" ? "text" : "unset",
            backgroundClip: activeTab === "gains" ? "text" : "unset",
            WebkitTextFillColor: activeTab === "gains" ? "transparent" : "unset",
            color: activeTab === "gains" ? "transparent" : "#7a8190",
            border: activeTab === "gains" ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          📈 Gains
        </span>
        <span
          onClick={() => setActiveTab("diet")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "diet" ? "linear-gradient(to right, #00f2fe, #a18cd1)" : "transparent",
            WebkitBackgroundClip: activeTab === "diet" ? "text" : "unset",
            backgroundClip: activeTab === "diet" ? "text" : "unset",
            WebkitTextFillColor: activeTab === "diet" ? "transparent" : "unset",
            color: activeTab === "diet" ? "transparent" : "#7a8190",
            border: activeTab === "diet" ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          🥗 Nutrition
        </span>
        <span
          onClick={() => setActiveTab("attendance")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "attendance" ? "linear-gradient(to right, #00f2fe, #a18cd1)" : "transparent",
            WebkitBackgroundClip: activeTab === "attendance" ? "text" : "unset",
            backgroundClip: activeTab === "attendance" ? "text" : "unset",
            WebkitTextFillColor: activeTab === "attendance" ? "transparent" : "unset",
            color: activeTab === "attendance" ? "transparent" : "#7a8190",
            border: activeTab === "attendance" ? "1px solid rgba(0, 242, 254, 0.3)" : "1px solid transparent",
            transition: "all 0.15s ease",
          }}
        >
          📅 Attendance
        </span>
      </div>

      {/* Tab Contents */}
      {activeTab === "workouts" && (
        <div key="workouts" className="grid animate-tab-enter">
          <SessionForm onCreated={onSessionCreated} />
          <SessionHistory sessions={sessions} />
        </div>
      )}

      {activeTab === "attendance" && (
        <div key="attendance" className="animate-tab-enter" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <AttendanceHeatmap sessions={sessions} />
        </div>
      )}

      {activeTab === "gains" && (
        <div key="gains" className="animate-tab-enter" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <GainsPanel measurements={measurements} onAdd={addMeasurement} />
        </div>
      )}

      {activeTab === "diet" && (
        <div key="diet" className="animate-tab-enter" style={{ maxWidth: "850px", margin: "0 auto" }}>
          <NutritionTracker />
        </div>
      )}
      </div>
    </div>
  );
};

export default App;


