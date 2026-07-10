import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  User, 
  LogOut,
  TrendingUp
} from "lucide-react";

export default function Sidebar() {
  const { logout, currentUser } = useAuth();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { to: "/budget", label: "Budget & Savings", icon: Wallet },
    { to: "/profile", label: "User Profile", icon: User }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <TrendingUp className="brand-icon" />
          <span className="brand-text">FutureExpense</span>
        </div>
        
        {currentUser && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <p className="user-name">{currentUser.displayName || "User"}</p>
              <p className="user-email">{currentUser.email}</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={item.to === "/"}
              >
                <Icon className="link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button onClick={logout} className="sidebar-logout-btn">
          <LogOut className="link-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              end={item.to === "/"}
            >
              <Icon className="mobile-link-icon" />
              <span className="mobile-link-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        /* Desktop Sidebar styles */
        .desktop-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background-color: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          margin-bottom: 2rem;
        }

        .brand-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: var(--primary);
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.025em;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0.75rem;
          background-color: var(--bg-app);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          border: 1px solid var(--border);
        }

        .user-avatar {
          width: 2.25rem;
          height: 2.25rem;
          background-color: var(--primary-light);
          color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }

        .user-info {
          overflow: hidden;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          flex: 1;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9375rem;
          transition: var(--transition-all);
        }

        .sidebar-link:hover {
          background-color: var(--bg-app);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background-color: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .link-icon {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9375rem;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: var(--transition-all);
          margin-top: auto;
        }

        .sidebar-logout-btn:hover {
          background-color: var(--danger-light);
          color: var(--danger);
        }

        /* Mobile Bottom Nav styles */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border);
          justify-content: space-around;
          align-items: center;
          padding: 0.5rem;
          z-index: 100;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        }

        .mobile-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          flex: 1;
          height: 100%;
        }

        .mobile-link-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .mobile-nav-link.active {
          color: var(--primary);
          font-weight: 600;
        }

        /* Responsive displays */
        @media (max-width: 1024px) {
          .desktop-sidebar {
            display: none;
          }
          .mobile-bottom-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
