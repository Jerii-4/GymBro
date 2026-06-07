import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isDashboard?: boolean;
};

export const AboutModal: React.FC<Props> = ({ isOpen, onClose, isDashboard }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDashboard ? "rgba(10, 12, 17, 0.4)" : "rgba(10, 12, 17, 0.85)",
        backdropFilter: isDashboard ? "blur(4px)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: isDashboard ? "rgba(18, 21, 30, 0.6)" : "#12151e",
          backdropFilter: isDashboard ? "blur(16px)" : "none",
          border: isDashboard ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid #1f2430",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          position: "relative",
          animation: "scaleIn 0.2s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            color: "#7a8190",
            fontSize: "1.2rem",
            cursor: "pointer"
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="/assets/logo.png"
            alt="GymBro"
            style={{ width: "80px", height: "80px", objectFit: "contain", marginBottom: "12px" }}
          />
          <h2 style={{ margin: 0, color: "#ffffff", fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "1px" }}>
            ABOUT GYMBRO
          </h2>
        </div>

        <div style={{ color: "#a0a5b5", fontSize: "0.95rem", lineHeight: "1.6", textAlign: "justify" }}>
          <p style={{ margin: "0 0 16px 0" }}>
            Welcome to the ultimate fitness command center designed to forge your physique. GymBro is a premium platform that seamlessly choreographs your entire training journey. Elevate your performance by monitoring sets, reps, and weights, logging custom rest targets, maintaining strict nutrition goals, and visualizing your consistency over a dynamic attendance timeline.
          </p>
          <p style={{ margin: 0 }}>
            Designed to empower athletes, bodybuilders, and fitness enthusiasts to build their dream body with uncompromising style and precision. Track your metrics in real-time, analyze your muscle growth history, and stay accountable with a visual gaming-style overview. GymBro is your ultimate digital fitness diary, built to accompany you through every heavy set.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "28px",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: "transparent",
            color: "#a18cd1",
            border: "1px solid #a18cd1",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};
