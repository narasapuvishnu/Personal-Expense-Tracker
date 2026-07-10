import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Profile from "./pages/Profile";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="global-loader-screen">
        <div className="loader-spinner"></div>
        <p className="loader-text">Loading secure session...</p>
        <style>{`
          .global-loader-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-app);
            color: var(--text-secondary);
          }
          .loader-spinner {
            border: 3px solid var(--border);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 0.8s linear infinite;
          }
          .loader-text {
            margin-top: 1rem;
            font-size: 0.875rem;
            font-weight: 600;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}

// Public Route Guard (Redirects logged-in users back to dashboard)
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // Let the global router loader handle it

  return !currentUser ? children : <Navigate to="/" replace />;
}

// Dashboard Layout Wrapper
function DashboardLayout() {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Personal Expense Tracker";
      case "/transactions":
        return "Transaction Ledger";
      case "/budget":
        return "Budget & Savings Plan";
      case "/profile":
        return "Profile Settings";
      default:
        return "FutureExpense Tracker";
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={getTitle()} />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ExpenseProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />

            {/* Guarded App Console Workspace */}
            <Route 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Wildcard Fallback redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ExpenseProvider>
      </AuthProvider>
    </Router>
  );
}
