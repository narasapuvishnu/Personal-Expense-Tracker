import React from "react";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../services/dbService";
import { Cloud, HelpCircle, Database, ShieldAlert, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ title = "Personal Expense Tracker" }) {
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar-header">
      <div className="navbar-title-container">
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-actions">
        {/* Sync Mode Badge */}
        {isDemoMode ? (
          <div className="db-badge badge-demo-info" title="Using Local Storage for data storage. No database cloud connection is set up.">
            <ShieldAlert className="badge-icon-left" />
            <span>Local Demo Mode</span>
          </div>
        ) : (
          <div className="db-badge badge-cloud-info" title="Successfully connected to your Firebase Firestore cloud database.">
            <Cloud className="badge-icon-left" />
            <span>Cloud Synced</span>
          </div>
        )}

        {/* User Dropdown */}
        {currentUser && (
          <div className="navbar-user-dropdown" ref={dropdownRef}>
            <button 
              className="navbar-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="navbar-avatar">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="navbar-username">{currentUser.displayName || "User"}</span>
              <ChevronDown className="avatar-chevron" />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-user-header">
                  <p className="dropdown-fullname">{currentUser.displayName || "Tracker User"}</p>
                  <p className="dropdown-email">{currentUser.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-item logout-item">
                  <LogOut className="dropdown-item-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .navbar-header {
          height: var(--navbar-height);
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .navbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.015em;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        /* Database Synced Badges */
        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: help;
        }

        .badge-demo-info {
          background-color: var(--warning-light);
          color: var(--warning-hover);
          border: 1px dashed rgba(245, 158, 11, 0.4);
        }

        .badge-cloud-info {
          background-color: var(--success-light);
          color: var(--success-hover);
          border: 1px dashed rgba(16, 185, 129, 0.4);
        }

        .badge-icon-left {
          width: 0.9rem;
          height: 0.9rem;
        }

        /* Avatar and Dropdown Styles */
        .navbar-user-dropdown {
          position: relative;
        }

        .navbar-avatar-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.375rem 0.5rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }

        .navbar-avatar-btn:hover {
          background-color: var(--bg-app);
        }

        .navbar-avatar {
          width: 2rem;
          height: 2rem;
          background-color: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .navbar-username {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .avatar-chevron {
          width: 0.9rem;
          height: 0.9rem;
          color: var(--text-muted);
        }

        /* Dropdown Content */
        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.5rem 0;
          animation: fadeIn 0.15s ease-out;
          z-index: 120;
        }

        .dropdown-user-header {
          padding: 0.75rem 1rem;
        }

        .dropdown-fullname {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-primary);
          margin-bottom: 0.125rem;
        }

        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--border);
          margin: 0.375rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          width: 100%;
          border: none;
          background: none;
          font-size: 0.875rem;
          text-align: left;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .dropdown-item:hover {
          background-color: var(--bg-app);
          color: var(--text-primary);
        }

        .dropdown-item-icon {
          width: 1rem;
          height: 1rem;
        }

        .logout-item:hover {
          background-color: var(--danger-light);
          color: var(--danger);
        }

        @media (max-width: 640px) {
          .navbar-header {
            padding: 0 1rem;
          }
          .navbar-username {
            display: none;
          }
          .db-badge span {
            display: none;
          }
          .db-badge {
            padding: 0.375rem;
            border-radius: 50%;
          }
        }
      `}</style>
    </header>
  );
}
