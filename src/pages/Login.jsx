import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, Mail, Lock, ShieldAlert } from "lucide-react";
import { isDemoMode } from "../services/dbService";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Monitor and optimize your spending habit</p>
        </div>

        {isDemoMode && (
          <div className="alert alert-warning" style={{ padding: "0.75rem", marginBottom: "1.25rem", gap: "0.5rem" }}>
            <ShieldAlert className="alert-icon" style={{ width: "1.1rem", height: "1.1rem", marginTop: 0 }} />
            <div className="alert-content">
              <p className="alert-title" style={{ fontSize: "0.8rem", margin: 0 }}>
                Demo Mode: Sign up any dummy account to begin, or use a pre-existing one.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
            <div className="alert-content">
              <p className="alert-title">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input 
                type="email" 
                className="form-input icon-padding"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: "0.8125rem" }} className="auth-link">
                Forgot Password?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input 
                type="password" 
                className="form-input icon-padding"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create an account
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
