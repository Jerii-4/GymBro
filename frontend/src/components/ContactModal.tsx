import React, { useState } from "react";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleDateString();
    const bodyText = `Contact Inquiry from GymBro:

Name: ${firstName}
Email Address: ${emailAddress}
Phone Number: ${phoneNumber}
Inquiry Date: ${currentDate}

Message details:
${details}`;

    const mailtoUrl = `mailto:jerinbtc17@gmail.com?subject=${encodeURIComponent(
      subject || "GymBro Collaboration Inquiry"
    )}&body=${encodeURIComponent(bodyText)}`;

    window.location.href = mailtoUrl;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11, 14, 20, 0.9)",
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
        className="contact-modal-inner"
        style={{
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row (No background image banner) */}
        <div className="contact-modal-header">
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "1.5px",
                fontFamily: "'Chakra Petch', sans-serif",
              }}
            >
              CONTACT ME
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#a0a5b5",
                letterSpacing: "0.5px",
              }}
            >
              WE'D LOVE TO HEAR WHAT YOU THINK
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#7a8190",
              fontSize: "1.3rem",
              cursor: "pointer",
              transition: "color 0.15s",
              padding: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7a8190")}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content wrapper */}
        <div className="contact-modal-scrollable">
          {/* Content Area Grid */}
          <div className="contact-modal-grid">
            {/* Left Column: Picture and details */}
            <div className="contact-modal-left">
              {/* Owner Picture (Above Email Us) */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img
                  src="/assets/owner.jpg"
                  alt="Jerin Thomas"
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #a18cd1",
                    boxShadow: "0 4px 16px rgba(161, 140, 209, 0.25)",
                  }}
                />
                <div style={{ marginTop: "0px" }}>
                  <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.5px" }}>Jerin Thomas</h4>
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#7a8190", fontWeight: "600", letterSpacing: "1px" }}>OWNER</p>
                </div>
              </div>

              {/* Email section */}
              <div className="contact-modal-left-text-block">
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  EMAIL US
                </h4>
                <a
                  href="mailto:jerinbtc17@gmail.com"
                  style={{
                    color: "#a18cd1",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  jerinbtc17@gmail.com
                </a>
              </div>

              {/* X section */}
              <div className="contact-modal-left-text-block">
                <h4
                  style={{
                    margin: "0 0 4px 0",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px",
                    fontWeight: 700,
                  }}
                >
                  X (TWITTER)
                </h4>
                <a
                  href="https://x.com/0xjerrii"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#a18cd1",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  @0xjerrii
                </a>
              </div>

              {/* Centered Icons Row */}
              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                {/* Email Icon */}
                <a
                  href="mailto:jerinbtc17@gmail.com"
                  title="Compose Email"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#e9ecf5",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#a18cd1";
                    e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
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
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#e9ecf5",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#a18cd1";
                    e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
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
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#e9ecf5",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#a18cd1";
                    e.currentTarget.style.background = "rgba(161, 140, 209, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="contact-modal-right">
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  fontFamily: "'Chakra Petch', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                LET'S WORK TOGETHER
              </h3>

              <form onSubmit={handleSubmit} className="contact-modal-form">
                {/* Row 1: Name */}
                <div className="contact-modal-form-group">
                  <label className="contact-modal-form-label">
                    NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="contact-modal-form-input"
                  />
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="contact-modal-form-row">
                  <div className="contact-modal-form-group">
                    <label className="contact-modal-form-label">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="contact-modal-form-input"
                    />
                  </div>
                  <div className="contact-modal-form-group">
                    <label className="contact-modal-form-label">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="contact-modal-form-input"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="contact-modal-form-group">
                  <label className="contact-modal-form-label">
                    SUBJECT *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="contact-modal-form-input"
                  />
                </div>

                {/* Details */}
                <div className="contact-modal-form-group">
                  <label className="contact-modal-form-label">
                    DETAILS *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="contact-modal-form-textarea"
                  />
                </div>

                {/* Submit Outline Button */}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid #ffffff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: "0.9rem",
                    letterSpacing: "1px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                >
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
