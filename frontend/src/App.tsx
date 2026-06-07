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
import { ContactModal } from "./components/ContactModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { AboutModal } from "./components/AboutModal";


const App: React.FC = () => {
  const { token, username, logout, sessions, measurements, addMeasurement } = useLocalStore();
  const [view, setView] = useState<"landing" | "login" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"workouts" | "attendance" | "gains" | "diet" | "profile">("workouts");
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pfp, setPfp] = useState<string>("/assets/profile.png");

  useEffect(() => {
    if (username) {
      setPfp(localStorage.getItem(`gymbro_pfp_${username}`) || "/assets/profile.png");
    } else {
      setPfp("/assets/profile.png");
    }
  }, [username, activeTab]);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(`gymbro_pfp_${username}`, base64String);
        setPfp(base64String);
        // Dispatch storage event to keep other panels synced
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

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
        <header className="landing-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/assets/logo.png"
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

          <div style={{ display: "flex", gap: "10px" }}>
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
              <span className="gradient-text">{token ? "Dashboard" : "Login / Signup"}</span>
            </button>

            <button
              onClick={() => setShowAbout(true)}
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
              <span className="gradient-text">About</span>
            </button>

            <button
              onClick={() => setShowContact(true)}
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
              <span className="gradient-text">Contact</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="landing-content-wrapper">
          {/* Badge */}
          <div className="landing-badge" style={{ pointerEvents: "auto" }}>
            Your Personal Fitness Companion
          </div>

          {/* Hero Group — heading + tagline + CTA together */}
          <div className="landing-hero-group">
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
          </div>

          {/* Feature Grid */}
          <div className="landing-feature-grid">
            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px", height: "40px", alignItems: "center" }}>
                <img src="/assets/exercise.png" alt="Workouts" style={{ height: "36px", width: "auto" }} />
                <img src="/assets/attendance.png" alt="Attendance" style={{ height: "36px", width: "auto" }} />
              </div>
              <h3 className="gradient-text" style={{ margin: 0, fontSize: "1.1rem" }}>
                Workout & Attendance
              </h3>
              <p className="glass-card-tagline">Log every set, track your gym attendance, and build consistency.</p>
            </div>

            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", marginBottom: "12px", height: "40px", alignItems: "center" }}>
                <img src="/assets/gain.png" alt="Gains" style={{ height: "36px", width: "auto" }} />
              </div>
              <h3 className="gradient-text" style={{ margin: 0, fontSize: "1.1rem" }}>
                Gains Progress
              </h3>
              <p className="glass-card-tagline">Visualize strength gains and body measurements over time.</p>
            </div>

            <div className="glass-card" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", marginBottom: "12px", height: "40px", alignItems: "center" }}>
                <img src="/assets/nutrition.png" alt="Diet" style={{ height: "36px", width: "auto", filter: "grayscale(100%)" }} />
              </div>
              <h3 className="gradient-text" style={{ margin: 0, fontSize: "1.1rem" }}>
                Smart Diet
              </h3>
              <p className="glass-card-tagline">Monitor macros, calories, and stay on top of your nutrition goals.</p>
            </div>
          </div>
        </div>
        <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} isDashboard={view === "dashboard"} />
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} isDashboard={view === "dashboard"} />
      </div>
    );
  }

  // 1. Show Login View (Unauthenticated)
  if (view === "login") {
    return (
      <>
        <Login
          onBack={() => setView("landing")}
          onAboutClick={() => setShowAbout(true)}
          onContactClick={() => setShowContact(true)}
        />
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} isDashboard={view === "dashboard"} />
        <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} isDashboard={view === "dashboard"} />
      </>
    );
  }

  // 3. Show Dashboard View (Authenticated)
  return (
    <div className="dashboard-wrapper">
      <div className="app-shell animate-fade-in-up">
      {/* Header bar with profile section and Log Out button */}
      {/* Header bar with profile section and Log Out button */}
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar Upload / Profile Section */}
          <label
            style={{
              position: "relative",
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              border: "2px solid #3a4256",
              cursor: "pointer",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d0f13",
              transition: "border-color 0.2s"
            }}
            title="Click to change profile picture"
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a18cd1"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#3a4256"}
          >
            <img src={pfp} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <input type="file" accept="image/*" onChange={handlePfpChange} style={{ display: "none" }} />
          </label>
          <div>
            <h1 style={{ color: "#e9ecf5", margin: 0, fontSize: "1.4rem", fontFamily: "'Chakra Petch', sans-serif", lineHeight: 1.1 }}>GymBro</h1>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
              Welcome back, <strong style={{ color: "#ffffff" }}>{username}</strong>!
            </p>
          </div>
        </div>
        <div className="dashboard-header-buttons" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setView("landing")}
            style={{
              border: "1px solid #3a4256",
              padding: "8px 16px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#ffffff"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4f5b75";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a4256";
            }}
          >
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setShowAbout(true)}
            style={{
              border: "1px solid #3a4256",
              padding: "8px 16px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#ffffff"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4f5b75";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a4256";
            }}
          >
            <span>About</span>
          </button>

          <button
            onClick={() => setShowContact(true)}
            style={{
              border: "1px solid #3a4256",
              padding: "8px 16px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "#ffffff"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4f5b75";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a4256";
            }}
          >
            <span>Contact</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: "#7a8190",
              border: "1px solid #3a4256",
              padding: "8px 16px",
              fontSize: "0.9rem",
              boxShadow: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "#4f5b75";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#3a4256";
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="no-scrollbar desktop-tab-container"
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0 24px",
          padding: "8px 12px",
          background: "rgba(16, 19, 26, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          flexWrap: "nowrap",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
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
            background: activeTab === "workouts" ? "#1f2430" : "transparent",
            color: activeTab === "workouts" ? "#ffffff" : "#7a8190",
            border: activeTab === "workouts" ? "1px solid #3a4256" : "1px solid transparent",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src="/assets/exercise.png"
            alt=""
            style={{
              width: "18px",
              height: "18px",
              objectFit: "contain",
              filter: activeTab === "workouts" ? "none" : "grayscale(1) opacity(0.6)"
            }}
          />
          Workouts
        </span>
        <span
          onClick={() => setActiveTab("gains")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "gains" ? "#1f2430" : "transparent",
            color: activeTab === "gains" ? "#ffffff" : "#7a8190",
            border: activeTab === "gains" ? "1px solid #3a4256" : "1px solid transparent",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src="/assets/gain.png"
            alt=""
            style={{
              width: "18px",
              height: "18px",
              objectFit: "contain",
              filter: activeTab === "gains" ? "none" : "grayscale(1) opacity(0.6)"
            }}
          />
          Gains
        </span>
        <span
          onClick={() => setActiveTab("diet")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "diet" ? "#1f2430" : "transparent",
            color: activeTab === "diet" ? "#ffffff" : "#7a8190",
            border: activeTab === "diet" ? "1px solid #3a4256" : "1px solid transparent",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src="/assets/nutrition.png"
            alt=""
            style={{
              width: "18px",
              height: "18px",
              objectFit: "contain",
              filter: activeTab === "diet" ? "none" : "grayscale(1) opacity(0.6)"
            }}
          />
          Nutrition
        </span>
        <span
          onClick={() => setActiveTab("attendance")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "attendance" ? "#1f2430" : "transparent",
            color: activeTab === "attendance" ? "#ffffff" : "#7a8190",
            border: activeTab === "attendance" ? "1px solid #3a4256" : "1px solid transparent",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src="/assets/attendance.png"
            alt=""
            style={{
              width: "18px",
              height: "18px",
              objectFit: "contain",
              filter: activeTab === "attendance" ? "none" : "grayscale(1) opacity(0.6)"
            }}
          />
          Attendance
        </span>
        <span
          onClick={() => setActiveTab("profile")}
          style={{
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.95rem",
            background: activeTab === "profile" ? "#1f2430" : "transparent",
            color: activeTab === "profile" ? "#ffffff" : "#7a8190",
            border: activeTab === "profile" ? "1px solid #3a4256" : "1px solid transparent",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src={pfp}
            alt=""
            style={{
              width: "18px",
              height: "18px",
              borderRadius: pfp !== "/assets/profile.png" ? "50%" : "0",
              objectFit: "cover",
              filter: activeTab === "profile" ? "none" : "grayscale(1) opacity(0.6)"
            }}
          />
          Profile
        </span>
      </div>

      {/* Mobile Tab Selection Dropdown */}
      <div className="mobile-tab-dropdown-container" style={{ position: "relative", zIndex: 50 }}>
        <label style={{ display: "block", fontSize: "0.8rem", color: "#7a8190", marginBottom: "8px", fontWeight: 700, letterSpacing: "1px" }}>SELECT SECTION</label>
        
        {/* Dropdown Header */}
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "12px 16px",
            background: "#12151e",
            border: "1px solid #1f2430",
            borderRadius: "10px",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: 700,
            fontFamily: "'Chakra Petch', sans-serif",
            cursor: "pointer",
            boxSizing: "border-box"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img 
              src={
                activeTab === "workouts" ? "/assets/exercise.png" :
                activeTab === "gains" ? "/assets/gain.png" :
                activeTab === "diet" ? "/assets/nutrition.png" :
                activeTab === "attendance" ? "/assets/attendance.png" :
                pfp
              } 
              alt="" 
              style={{ 
                width: "20px", 
                height: "20px", 
                objectFit: "contain",
                borderRadius: activeTab === "profile" && pfp !== "/assets/profile.png" ? "50%" : "0"
              }} 
            />
            {
              activeTab === "workouts" ? "Workouts" :
              activeTab === "gains" ? "Gains" :
              activeTab === "diet" ? "Nutrition" :
              activeTab === "attendance" ? "Attendance" :
              "Profile"
            }
          </div>
          <div style={{ color: "#7a8190", fontSize: "0.8rem", transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
            ▼
          </div>
        </div>

        {/* Dropdown List */}
        {dropdownOpen && (
          <>
            <div 
              onClick={() => setDropdownOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99,
                background: "transparent"
              }}
            />
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "6px",
                background: "#12151e",
                border: "1px solid #1f2430",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 100,
                overflow: "hidden"
              }}
            >
              {[
                { id: "workouts", label: "Workouts", icon: "/assets/exercise.png" },
                { id: "gains", label: "Gains", icon: "/assets/gain.png" },
                { id: "diet", label: "Nutrition", icon: "/assets/nutrition.png" },
                { id: "attendance", label: "Attendance", icon: "/assets/attendance.png" },
                { id: "profile", label: "Profile", icon: pfp, isProfile: true }
              ].map(sec => (
                <div
                  key={sec.id}
                  onClick={() => {
                    setActiveTab(sec.id as any);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    color: activeTab === sec.id ? "#ffffff" : "#a0a5b5",
                    background: activeTab === sec.id ? "#1f2430" : "transparent",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: activeTab === sec.id ? "700" : "600",
                    borderBottom: "1px solid rgba(255,255,255,0.02)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <img 
                    src={sec.icon} 
                    alt="" 
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      objectFit: "contain",
                      borderRadius: sec.isProfile && pfp !== "/assets/profile.png" ? "50%" : "0"
                    }} 
                  />
                  {sec.label}
                </div>
              ))}
            </div>
          </>
        )}
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

      {activeTab === "profile" && (
        <div key="profile" className="animate-tab-enter" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <ProfilePanel />
        </div>
      )}
      </div>
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} isDashboard={view === "dashboard"} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} isDashboard={view === "dashboard"} />
    </div>
  );
};

export default App;


