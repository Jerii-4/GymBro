import React, { useState } from "react";
import { useLocalStore } from "../hooks/useLocalStore";

interface LoginProps {
  onBack: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack, onAboutClick, onContactClick }) => {
  const { login, register } = useLocalStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim() || (isRegistering && !email.trim())) {
      setError("Please fill out all fields");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        const success = await register(username, email, password);
        if (success) {
          const loginSuccess = await login(username, password);
          if (!loginSuccess) {
            setError("Account created, but automatic login failed. Please sign in.");
            setIsRegistering(false);
          }
        } else {
          setError("Failed to register. Username or email might be taken.");
        }
      } else {
        const success = await login(username, password);
        if (!success) {
          setError("Invalid credentials");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f13",
        color: "#e9ecf5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      {/* Top Header Bar */}
      <header className="login-header">
        {/* Left Side Links */}
        <div className="login-header-left">
          <span
            onClick={() => {
              setIsRegistering(false);
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setError(null);
              onBack();
            }}
            className="login-header-link"
            style={{ color: "#ffffff" }}
          >
            Home
          </span>
          <span
            onClick={onAboutClick}
            className="login-header-link"
            style={{ color: "#a0a5b5" }}
          >
            About
          </span>
          <span
            onClick={onContactClick}
            className="login-header-link"
            style={{ color: "#a0a5b5" }}
          >
            Contact
          </span>
        </div>

        {/* Right Side Auth Tabs */}
        <div className="login-header-right">
          <span
            onClick={() => {
              setIsRegistering(false);
              setError(null);
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="login-header-signin"
            style={{
              color: !isRegistering ? "#ffffff" : "#7a8190",
              borderBottom: !isRegistering ? "2px solid #ffffff" : "none"
            }}
          >
            Sign in
          </span>
          <button
            onClick={() => {
              setIsRegistering(true);
              setError(null);
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="login-header-signup"
            style={{
              background: isRegistering ? "#ffffff" : "transparent",
              color: isRegistering ? "#0d0f13" : "#ffffff",
              border: isRegistering ? "none" : "1px solid #ffffff"
            }}
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Split Pane Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 20px 40px",
          boxSizing: "border-box"
        }}
      >
        <div className="login-card-container">
          <div className="login-overlay-pane">
            {/* Top GYMBRO Brand header info */}
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "2px", color: "#ffffff", fontSize: "1.9rem", fontWeight: 800 }}>
                GYMBRO
              </h2>
              <p style={{ margin: 0, color: "#a0a5b5", fontSize: "0.85rem", letterSpacing: "0.5px", fontWeight: 600 }}>
                Forge your physique, track your evolution.
              </p>
            </div>

            {/* Login form details */}
            <div style={{ margin: "auto 0", width: "100%", padding: "24px 0" }}>
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "1.75rem",
                  fontFamily: "'Chakra Petch', sans-serif",
                  color: "#ffffff",
                  letterSpacing: "1px",
                  fontWeight: 700
                }}
              >
                {isRegistering ? "Create Account" : "Hello ! Welcome Back"}
              </h3>

              {error && (
                <div
                  style={{
                    background: "rgba(235, 87, 87, 0.1)",
                    border: "1px solid rgba(235, 87, 87, 0.3)",
                    color: "#eb5757",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "0.9rem"
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Username field */}
                <div>
                  <input
                    type="text"
                    placeholder={isRegistering ? "Enter Username" : "Enter Username or Email"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      background: "rgba(27, 31, 43, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Email field (only in register) */}
                {isRegistering && (
                  <div>
                    <input
                      type="email"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        background: "rgba(27, 31, 43, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "0.95rem",
                        fontFamily: "inherit",
                        outline: "none"
                      }}
                    />
                  </div>
                )}

                {/* Password field */}
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "16px 50px 16px 20px",
                      background: "rgba(27, 31, 43, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      outline: "none"
                    }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#7a8190",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      userSelect: "none",
                      fontWeight: "600"
                    }}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </span>
                </div>

                {/* Confirm Password field (only in register) */}
                {isRegistering && (
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "16px 50px 16px 20px",
                        background: "rgba(27, 31, 43, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "0.95rem",
                        fontFamily: "inherit",
                        outline: "none"
                      }}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: "18px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#7a8190",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        userSelect: "none",
                        fontWeight: "600"
                      }}
                    >
                      {showConfirmPassword ? "HIDE" : "SHOW"}
                    </span>
                  </div>
                )}

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    marginTop: "8px",
                    background: "#ffffff",
                    color: "#0a0c10",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "opacity 0.15s",
                    fontFamily: "'Chakra Petch', sans-serif",
                    letterSpacing: "0.5px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {isLoading ? "Please wait..." : isRegistering ? "Sign Up" : "Sign In"}
                </button>
              </form>
            </div>

            {/* Bottom Toggle Text */}
            <div style={{ textAlign: "center", marginTop: "auto" }}>
              <p style={{ margin: 0, color: "#7a8190", fontSize: "0.9rem" }}>
                {isRegistering ? "Already have an account ?" : "Don't have an account ?"}{" "}
                <span
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                    setUsername("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  style={{ color: "#ffffff", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}
                >
                  {isRegistering ? "Sign In" : "Sign Up!"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
