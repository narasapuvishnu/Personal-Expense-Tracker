import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, User, Mail, Lock } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!displayName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(email.toLowerCase(), password, displayName.trim());
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create an account. Email might be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <TrendingUp className="logo-icon" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start tracking your personal finances today</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            <div className="alert-content">
              <p className="alert-title">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input 
                type="text" 
                className="form-input icon-padding"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input 
                type="email" 
                className="form-input icon-padding"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input 
                type="password" 
                className="form-input icon-padding"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input 
                type="password" 
                className="form-input icon-padding"
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log In
          </Link>
        </div>
      </div>

      <style>{`
        .logo-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: var(--primary-light);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          width: 2rem;
          height: 2rem;
          color: var(--primary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          width: 1.125rem;
          height: 1.125rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .icon-padding {
          padding-left: 2.75rem;
        }
      `}</style>
    </div>
  );
}
