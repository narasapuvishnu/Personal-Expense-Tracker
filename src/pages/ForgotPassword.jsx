import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.toLowerCase());
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset link. Ensure the email is registered.");
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
          <h2 className="auth-title">Password Recovery</h2>
          <p className="auth-subtitle">We will email you password reset instructions</p>
        </div>

        {success ? (
          <div className="success-recovery-state" style={{ textAlign: "center", animation: "fadeIn 0.3s ease-out" }}>
            <div className="success-icon-wrapper">
              <CheckCircle className="success-icon" />
            </div>
            <p className="success-msg-title">Check your inbox</p>
            <p className="success-msg-desc">
              If an account matches that email, we have sent a reset password link to help you get back in.
            </p>
            <Link to="/login" className="btn btn-secondary btn-full" style={{ marginTop: "1.5rem" }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
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
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Sending link..." : "Send Password Reset Link"}
              </button>
            </form>

            <div className="auth-footer" style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <Link to="/login" className="auth-link-back" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}
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

        /* Success screen styling */
        .success-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--success);
          margin-bottom: 1rem;
        }

        .success-icon {
          width: 3.5rem;
          height: 3.5rem;
        }

        .success-msg-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .success-msg-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .auth-link-back {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .auth-link-back:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
