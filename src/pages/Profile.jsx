import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../services/dbService";
import { 
  User, 
  Lock, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  LogOut,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

export default function Profile() {
  const { 
    currentUser, 
    updateProfileName, 
    changePassword, 
    logout 
  } = useAuth();

  // Name form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");

    if (!displayName.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }

    setNameLoading(true);
    try {
      await updateProfileName(displayName.trim());
      setNameSuccess("Profile name updated successfully!");
      
      confetti({
        particleCount: 30,
        spread: 30,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#a5b4fc']
      });

      setTimeout(() => setNameSuccess(""), 4000);
    } catch (err) {
      setNameError(err.message || "Failed to update profile name.");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 6) {
      setPwError("New password should be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(newPassword);
      setPwSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      
      confetti({
        particleCount: 30,
        spread: 30,
        origin: { y: 0.6 }
      });

      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to change password. Please re-authenticate.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="profile-header-row" style={{ marginBottom: "2rem" }}>
        <div>
          <h2 className="page-title-heading">User Settings</h2>
          <p className="page-subtitle-heading">Configure your user credentials and sync settings.</p>
        </div>
      </div>

      <div className="profile-grid-layout">
        {/* Left Column: Form Settings */}
        <div className="profile-settings-forms">
          {/* Update Name Form */}
          <div className="card settings-card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="section-title form-title-with-icon">
              <User className="color-primary" />
              Update Account Details
            </h3>

            {nameSuccess && (
              <div className="alert alert-success-inline" style={{ marginTop: "1rem" }}>
                <CheckCircle2 size={16} />
                <span>{nameSuccess}</span>
              </div>
            )}

            {nameError && (
              <div className="alert alert-danger-inline" style={{ marginTop: "1rem" }}>
                <AlertTriangle size={16} />
                <span>{nameError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  className="form-input text-muted" 
                  value={currentUser?.email || ""} 
                  disabled 
                  style={{ cursor: "not-allowed", backgroundColor: "#f1f5f9" }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={nameLoading}
              >
                {nameLoading ? "Updating..." : "Save Details"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card settings-card">
            <h3 className="section-title form-title-with-icon">
              <Lock className="color-primary" />
              Change Credentials
            </h3>

            {pwSuccess && (
              <div className="alert alert-success-inline" style={{ marginTop: "1rem" }}>
                <CheckCircle2 size={16} />
                <span>{pwSuccess}</span>
              </div>
            )}

            {pwError && (
              <div className="alert alert-danger-inline" style={{ marginTop: "1rem" }}>
                <AlertTriangle size={16} />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ marginTop: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={pwLoading}
              >
                {pwLoading ? "Updating Password..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Database Connection & Actions */}
        <div className="profile-settings-sidebar">
          {/* Database Status Card */}
          <div className="card db-info-card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="section-title form-title-with-icon">
              <Database className="color-primary" />
              Storage Connection
            </h3>

            <div className="db-connection-status-panel">
              {isDemoMode ? (
                <>
                  <div className="status-indicator warning-indicator">
                    <AlertTriangle size={24} />
                    <div>
                      <p className="status-indicator-title">Local Demo Mode</p>
                      <p className="status-indicator-desc">Saving to Browser Local Storage</p>
                    </div>
                  </div>

                  <div className="db-instructions-box">
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Info size={16} className="color-primary" style={{ flexShrink: 0, marginTop: "0.125rem" }} />
                      <p className="instruction-text font-bold">Connecting Firebase Firestore:</p>
                    </div>
                    <p className="instruction-desc">
                      Create a <code>.env</code> file in the root directory of your project and populate it with your Firebase project keys:
                    </p>
                    <pre className="env-template-code">
{`VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx`}
                    </pre>
                    <p className="instruction-desc" style={{ marginTop: "0.5rem" }}>
                      Restart the development server once added. The application will detect the keys and automatically switch to live cloud sync mode.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="status-indicator success-indicator">
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="status-indicator-title">Firebase Cloud Mode</p>
                      <p className="status-indicator-desc">Firestore Database & Auth Connected</p>
                    </div>
                  </div>

                  <div className="db-instructions-box active-db-box">
                    <p className="instruction-desc">
                      Your data is securely stored and synchronized across devices using Firebase Cloud services.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Log Card */}
          <div className="card quick-actions-card">
            <h3 className="section-title" style={{ marginBottom: "1.25rem" }}>Session Controls</h3>
            <button onClick={logout} className="btn btn-danger btn-full btn-icon-label">
              <LogOut size={16} />
              <span>Logout of Account</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1.25fr;
          gap: 1.5rem;
          align-items: start;
        }

        .form-title-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .color-primary { color: var(--primary); }

        /* Inline alert alerts */
        .alert-success-inline, .alert-danger-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
        }
        
        .alert-success-inline {
          background-color: var(--success-light);
          color: var(--success-hover);
        }
        
        .alert-danger-inline {
          background-color: var(--danger-light);
          color: var(--danger-hover);
        }

        /* Database Status indicator panels */
        .db-connection-status-panel {
          margin-top: 1.25rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
        }

        .warning-indicator {
          background-color: var(--warning-light);
          color: var(--warning-hover);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .success-indicator {
          background-color: var(--success-light);
          color: var(--success-hover);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-indicator-title {
          font-weight: 700;
          font-size: 0.9375rem;
          line-height: 1.2;
        }

        .status-indicator-desc {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        /* DB Instructions layout */
        .db-instructions-box {
          background-color: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .active-db-box {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
          padding: 1.5rem 1rem;
        }

        .instruction-text {
          font-size: 0.8125rem;
          color: var(--text-primary);
        }

        .instruction-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .env-template-code {
          margin-top: 0.75rem;
          background-color: #1e293b;
          color: #f8fafc;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-family: 'Courier New', Courier, monospace;
          overflow-x: auto;
          white-space: pre-wrap;
          line-height: 1.3;
        }

        .btn-icon-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 1024px) {
          .profile-grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
