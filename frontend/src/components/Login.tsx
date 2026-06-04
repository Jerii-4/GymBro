import React, { useState } from "react";
import { useLocalStore } from "../hooks/useLocalStore";

interface LoginProps {
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onBack }) => {
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
        // Register flow with username, email, and password
        const success = await register(username, email, password);
        if (success) {
          // Auto login after successful registration using the registered username
          const loginSuccess = await login(username, password);
          if (!loginSuccess) {
            setError("Account created, but automatic login failed. Please sign in.");
            setIsRegistering(false);
          }
        } else {
          setError("Failed to register. Username or email might be taken.");
        }
      } else {
        // Login flow - username variable holds either username or email
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div className="card animate-fade-in-up" style={{ width: "100%", maxWidth: "420px", padding: "32px" }}>
        {onBack && (
          <div
            onClick={onBack}
            className="gradient-hover-text"
            style={{
              fontSize: "0.9rem",
              marginBottom: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "600",
            }}
          >
            ← Back to Home
          </div>
        )}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>

          <h1 style={{ color: "#e9ecf5", margin: "0 0 4px", fontSize: "2rem" }}>GymBro</h1>
          <p className="muted" style={{ margin: 0 }}>
            {isRegistering ? "Create your account to start tracking" : "Sign in to your fitness companion"}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(235, 87, 87, 0.1)",
              border: "1px solid rgba(235, 87, 87, 0.4)",
              color: "#eb5757",
              padding: "12px",
              borderRadius: "12px",
              marginBottom: "16px",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label className="muted" htmlFor="username">
              {isRegistering ? "Username" : "Username or Email ID"}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRegistering ? "Enter your username" : "Enter your username or email"}
              required
              disabled={isLoading}
              style={{ fontSize: "1rem" }}
            />
          </div>

          {isRegistering && (
            <div style={{ marginTop: "12px" }}>
              <label className="muted" htmlFor="email">Email ID</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email ID"
                required
                disabled={isLoading}
                style={{ fontSize: "1rem" }}
              />
            </div>
          )}

          <div style={{ marginTop: "12px" }}>
            <label className="muted" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                style={{ fontSize: "1rem", paddingRight: "60px", width: "100%" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="gradient-hover-text"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  userSelect: "none",
                }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </span>
            </div>
          </div>

          {isRegistering && (
            <div style={{ marginTop: "12px" }}>
              <label className="muted" htmlFor="confirm-password">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify your password"
                  required
                  disabled={isLoading}
                  style={{ fontSize: "1rem", paddingRight: "60px", width: "100%" }}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="gradient-hover-text"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    userSelect: "none",
                  }}
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              fontSize: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            <span className="gradient-text">
              {isLoading ? "Please wait..." : isRegistering ? "Create Account" : "Sign In"}
            </span>
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            {isRegistering ? "Already have an account?" : "New to GymBro?"}{" "}
            <span
              onClick={() => {
                if (!isLoading) {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  // Reset form fields on switch
                  setUsername("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }
              }}
              className="gradient-text"
              style={{
                cursor: "pointer",
                fontWeight: "600",
                textDecoration: "underline",
              }}
            >
              {isRegistering ? "Sign In" : "Register Now"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

