import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import MetricCard from "../components/MetricCard";
import { 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  AlertTriangle,
  Flame,
  Award,
  Wallet,
  Hash,
  Activity,
  CheckCircle2,
  CalendarCheck
} from "lucide-react";
import confetti from "canvas-confetti";

export default function Budget() {
  const {
    expenses,
    incomes,
    monthlyBudget,
    updateBudget,
    getMonthlyStats,
    getYearMonthKey
  } = useExpenses();

  const [budgetInput, setBudgetInput] = useState(monthlyBudget || "");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // default to current month
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Helper format months e.g. "2026-07" -> "July 2026"
  const formatMonthName = (monthKey) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Compile all transactions to get unique months for summary selection
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: "expense" })),
    ...incomes.map(i => ({ ...i, type: "income" }))
  ];

  const uniqueMonths = Array.from(
    new Set(allTransactions.map(tx => getYearMonthKey(tx.date)))
  ).filter(Boolean).sort((a, b) => new Date(b) - new Date(a));

  // Compute stats for selected month
  const stats = getMonthlyStats(selectedMonth);

  // Compute budget percentage and warnings using the selected month stats
  const budgetPercentage = monthlyBudget > 0 ? (stats.totalExpenses / monthlyBudget) * 100 : 0;
  const isBudgetExceeded = monthlyBudget > 0 && stats.totalExpenses > monthlyBudget;
  const isBudgetWarning = monthlyBudget > 0 && !isBudgetExceeded && budgetPercentage >= 80;

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      setErrorMsg("Please enter a valid positive number.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateBudget(val);
      setSuccessMsg("Monthly budget updated successfully!");
      
      // Fun effect: confetti on budget update!
      confetti({
        particleCount: 60,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#34d399', '#f59e0b']
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update budget.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    const prefix = val < 0 ? "-" : "";
    const amount = Math.abs(val);
    return `${prefix}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="budget-header-row" style={{ marginBottom: "2rem" }}>
        <div>
          <h2 className="page-title-heading">Budget & Savings Manager</h2>
          <p className="page-subtitle-heading">Configure budget limits and evaluate month-end summaries.</p>
        </div>
      </div>

      <div className="budget-grid-split">
        {/* Left: Configuration Form & Tracker Widget */}
        <div className="budget-config-section">
          {/* Set Budget Card */}
          <div className="card config-card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="section-title" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp className="color-primary" />
              Set Monthly Limit
            </h3>
            
            {successMsg && (
              <div className="alert alert-success-inline">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger-inline">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="budget-form">
              <div className="form-group">
                <label className="form-label">Budget Limit (₹)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input 
                    type="number" 
                    step="1"
                    className="form-input" 
                    placeholder="Enter limit e.g. 15000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save Limit"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Alert/Warning Card */}
          <div className="card limit-visualizer-card">
            <h3 className="section-title" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Wallet className="color-primary" />
              Limit Visualizer
            </h3>

            {monthlyBudget > 0 ? (
              <div className="gauge-details">
                <div className="gauge-indicator-bar-container">
                  <div className="gauge-label-row">
                    <span className="gauge-percentage-label">{budgetPercentage.toFixed(1)}% Consumed</span>
                    <span className="gauge-status-label font-bold">
                      {isBudgetExceeded ? "OVER-BUDGET" : isBudgetWarning ? "NEAR-LIMIT" : "STABLE"}
                    </span>
                  </div>
                  
                  <div className="progress-container" style={{ height: "14px", margin: "0.5rem 0" }}>
                    <div 
                      className={`progress-bar ${
                        isBudgetExceeded 
                          ? 'progress-bar-danger' 
                          : isBudgetWarning 
                            ? 'progress-bar-warning' 
                            : 'progress-bar-success'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {isBudgetExceeded && (
                  <div className="alert alert-danger" style={{ margin: "1rem 0 0 0" }}>
                    <Flame className="alert-icon" />
                    <div className="alert-content">
                      <p className="alert-title">Budget Limit Exceeded!</p>
                      <p className="alert-desc">
                        You have spent {formatCurrency(stats.totalExpenses)} out of your {formatCurrency(monthlyBudget)} limit for this month. Action is required.
                      </p>
                    </div>
                  </div>
                )}

                {isBudgetWarning && (
                  <div className="alert alert-warning" style={{ margin: "1rem 0 0 0" }}>
                    <AlertTriangle className="alert-icon" />
                    <div className="alert-content">
                      <p className="alert-title">Warning: 80% Utilization Threshold Reached</p>
                      <p className="alert-desc">
                        You've utilized {budgetPercentage.toFixed(0)}% of your allowance. Remaining budget is {formatCurrency(monthlyBudget - stats.totalExpenses)}.
                      </p>
                    </div>
                  </div>
                )}

                {!isBudgetExceeded && !isBudgetWarning && (
                  <div className="alert alert-success-box" style={{ margin: "1rem 0 0 0" }}>
                    <Award className="alert-icon" />
                    <div className="alert-content">
                      <p className="alert-title">Spending is on Track</p>
                      <p className="alert-desc">
                        Looking good! You have {formatCurrency(monthlyBudget - stats.totalExpenses)} left of your monthly budget.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-budget-set-state">
                <Wallet size={40} className="color-muted" />
                <p className="no-budget-msg">No budget set. Input a budget limit to track warnings and utilization meters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Monthly Summary Dashboard */}
        <div className="budget-summary-section card">
          <div className="summary-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CalendarCheck className="color-primary" />
              Monthly Summary Dashboard
            </h3>
            
            {/* Month selector */}
            <select 
              className="form-select month-picker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: "160px", padding: "0.5rem" }}
            >
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))}
              {/* Fallback to current month if not in list */}
              {!uniqueMonths.includes(getYearMonthKey(new Date())) && (
                <option value={getYearMonthKey(new Date())}>
                  {formatMonthName(getYearMonthKey(new Date()))}
                </option>
              )}
            </select>
          </div>

          <div className="summary-cards-grid">
            <MetricCard 
              title="Monthly Income" 
              value={formatCurrency(stats.totalIncome)} 
              subtext="Total earnings in month"
              icon={ArrowUpRight}
              variant="success"
            />
            <MetricCard 
              title="Monthly Expenses" 
              value={formatCurrency(stats.totalExpenses)} 
              subtext="Total spent in month"
              icon={ArrowDownLeft}
              variant="danger"
            />
            <MetricCard 
              title="Remaining Balance" 
              value={formatCurrency(stats.remainingBalance)} 
              subtext="Income - Expenses for month"
              icon={Wallet}
              variant={stats.remainingBalance >= 0 ? "success" : "danger"}
            />
            <MetricCard 
              title="Monthly Savings" 
              value={formatCurrency(stats.remainingBalance > 0 ? stats.remainingBalance : 0)} 
              subtext="Calculated monthly savings"
              icon={PiggyBank}
              variant="info"
            />
            <MetricCard 
              title="Highest Expense Category" 
              value={stats.highestExpenseCategory} 
              subtext={stats.highestAmount > 0 ? `Cost: ${formatCurrency(stats.highestAmount)}` : "No expenses recorded"}
              icon={Activity}
              variant="warning"
            />
            <MetricCard 
              title="Total Transactions" 
              value={stats.totalCount.toString()} 
              subtext="Total count of expenses"
              icon={Hash}
              variant="neutral"
            />
          </div>
        </div>
      </div>

      <style>{`
        .budget-grid-split {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
          align-items: start;
        }

        .color-primary { color: var(--primary); }
        .color-muted { color: var(--text-muted); }

        /* Inline Alerts */
        .alert-success-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--success-light);
          color: var(--success-hover);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .alert-danger-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--danger-light);
          color: var(--danger-hover);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        /* Success box styling */
        .alert-success-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background-color: var(--success-light);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          color: var(--success-hover);
        }

        .no-budget-set-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1rem;
          color: var(--text-muted);
        }

        .no-budget-msg {
          font-size: 0.875rem;
          margin-top: 0.75rem;
          line-height: 1.4;
          max-width: 280px;
        }

        /* Summary Dashboard cards layout */
        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .gauge-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .font-bold {
          font-weight: 700;
        }

        .month-picker {
          background-color: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          outline: none;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .month-picker:focus {
          border-color: var(--primary);
        }

        @media (max-width: 1200px) {
          .budget-grid-split {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
