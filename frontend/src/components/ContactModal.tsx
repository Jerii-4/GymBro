import React from "react";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11, 14, 20, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(22, 27, 38, 0.9)",
          border: "1px solid rgba(0, 242, 254, 0.25)",
          boxShadow: "0 20px 50px rgba(0, 242, 254, 0.15)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          position: "relative",
          boxSizing: "border-box",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in corner */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "#7a8190",
            fontSize: "1.5rem",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00f2fe")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7a8190")}
        >
          &times;
        </button>

        {/* Section 1: About */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#00f2fe",
              letterSpacing: "-0.5px",
            }}
          >
            About
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color: "#e9ecf5",
              margin: 0,
              textAlign: "justify",
            }}
          >
            Welcome to the ultimate fitness command center designed to forge your physique. This premium platform seamlessly choreographs your entire training journey. Elevate your performance by monitoring sets, reps, and weights, logging custom rest targets, maintaining strict nutrition goals, and visualizing your consistency over a dynamic attendance timeline. Designed to empower athletes, bodybuilders, and fitness enthusiasts to build their dream body with uncompromising style and precision.
          </p>
        </div>

        {/* Separator */}
        <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "20px 0" }} />

        {/* Section 2: Contact */}
        <div>
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#a18cd1",
              letterSpacing: "-0.5px",
            }}
          >
            Contact
          </h2>

          {/* Owner details with image */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <img
              src="/owner.jpg"
              alt="Jerin"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #00f2fe",
                boxShadow: "0 0 12px rgba(0, 242, 254, 0.25)",
              }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#e9ecf5" }}>Jerin</h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#7a8190" }}>Website Owner & Developer</p>
            </div>
          </div>
          
          {/* Centered Icons Row */}
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "16px" }}>
            {/* Email Icon */}
            <a
              href="mailto:jerinbtc17@gmail.com"
              title="Compose Email"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#e9ecf5",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00f2fe";
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 242, 254, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg style={{ width: "20px", height: "20px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>

            {/* GitHub Icon */}
            <a
              href="https://github.com/Jerii-4"
              target="_blank"
              rel="noreferrer"
              title="GitHub Profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#e9ecf5",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00f2fe";
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 242, 254, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg style={{ width: "20px", height: "20px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>

            {/* X Icon */}
            <a
              href="https://x.com/0xjerrii"
              target="_blank"
              rel="noreferrer"
              title="X Profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#e9ecf5",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00f2fe";
                e.currentTarget.style.background = "rgba(0, 242, 254, 0.1)";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 242, 254, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg style={{ width: "18px", height: "18px", fill: "currentColor" }} viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Close Button */}
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="cta-button"
            style={{
              padding: "10px 24px",
              fontSize: "0.88rem",
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
