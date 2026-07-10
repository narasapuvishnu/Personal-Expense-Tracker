import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import MetricCard from "../components/MetricCard";
import ExpenseForm from "../components/ExpenseForm";
import IncomeForm from "../components/IncomeForm";
import TransactionTable from "../components/TransactionTable";
import { 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet,
  Coins,
  AlertTriangle,
  Flame,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const {
    expenses,
    incomes,
    monthlyBudget,
    currentBalance,
    totalSavings,
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthRemainingBalance,
    deleteExpense,
    deleteIncome
  } = useExpenses();

  // Modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  // Compute budget warning percentage
  const budgetPercentage = monthlyBudget > 0 ? (currentMonthExpenses / monthlyBudget) * 100 : 0;
  const isBudgetExceeded = monthlyBudget > 0 && currentMonthExpenses > monthlyBudget;
  const isBudgetWarning = monthlyBudget > 0 && !isBudgetExceeded && budgetPercentage >= 80;

  // Compile list of recent transactions (latest 5 expenses/incomes combined)
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: "expense" })),
    ...incomes.map(i => ({ ...i, type: "income" }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

  const recentTransactions = allTransactions.slice(0, 5);

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteTransaction = async (tx) => {
    if (window.confirm(`Are you sure you want to delete this ${tx.type}?`)) {
      try {
        if (tx.type === "expense") {
          await deleteExpense(tx.id);
        } else {
          await deleteIncome(tx.id);
        }
      } catch (err) {
        alert(err.message || "Failed to delete item.");
      }
    }
  };

  // Helper format currency
  const formatCurrency = (val) => {
    const prefix = val < 0 ? "-" : "";
    const amount = Math.abs(val);
    return `${prefix}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-container">
      {/* Header section */}
      <div className="dashboard-header-row">
        <div>
          <h2 className="page-title-heading">Financial Overview</h2>
          <p className="page-subtitle-heading">Track your spending, budgets, and savings plan.</p>
        </div>
        <div className="dashboard-action-btns">
          <button 
            onClick={() => setShowIncomeModal(true)} 
            className="btn btn-success"
          >
            <Plus size={16} /> Add Income
          </button>
          <button 
            onClick={() => {
              setExpenseToEdit(null);
              setShowExpenseModal(true);
            }} 
            className="btn btn-primary"
          >
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* Budget Warning/Alert System */}
      {isBudgetExceeded && (
        <div className="alert alert-danger pulse-danger">
          <Flame className="alert-icon" />
          <div className="alert-content">
            <h4 className="alert-title">Budget Exceeded Alert!</h4>
            <p className="alert-desc">
              You have spent <strong>{formatCurrency(currentMonthExpenses)}</strong> this month, exceeding your monthly budget limit of <strong>{formatCurrency(monthlyBudget)}</strong>.
            </p>
          </div>
        </div>
      )}

      {isBudgetWarning && (
        <div className="alert alert-warning">
          <AlertTriangle className="alert-icon" />
          <div className="alert-content">
            <h4 className="alert-title">Budget Warning (80% Limit Passed)</h4>
            <p className="alert-desc">
              You've utilized <strong>{budgetPercentage.toFixed(1)}%</strong> of your budget. Total monthly expenses have reached <strong>{formatCurrency(currentMonthExpenses)}</strong> out of <strong>{formatCurrency(monthlyBudget)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="dashboard-grid">
        <MetricCard 
          title="Current Balance" 
          value={formatCurrency(currentBalance)} 
          subtext="Overall savings & pocket balance"
          icon={Coins}
          variant="info"
        />
        <MetricCard 
          title="Monthly Income" 
          value={formatCurrency(currentMonthIncome)} 
          subtext="Added in the current month"
          icon={ArrowUpRight}
          variant="success"
        />
        <MetricCard 
          title="Monthly Expenses" 
          value={formatCurrency(currentMonthExpenses)} 
          subtext="Spent in the current month"
          icon={ArrowDownLeft}
          variant="danger"
        />
        <MetricCard 
          title="Remaining Balance" 
          value={formatCurrency(currentMonthRemainingBalance)} 
          subtext="Monthly net balance"
          icon={Wallet}
          variant={currentMonthRemainingBalance >= 0 ? "success" : "danger"}
        />
        <MetricCard 
          title="Monthly Budget Limit" 
          value={formatCurrency(monthlyBudget)} 
          subtext={monthlyBudget > 0 ? `${budgetPercentage.toFixed(0)}% consumed` : "Budget not set"}
          icon={TrendingUp}
          variant="primary"
        />
        <MetricCard 
          title="Total Net Savings" 
          value={formatCurrency(totalSavings)} 
          subtext="Overall historical net worth"
          icon={DollarSign}
          variant="info"
        />
      </div>

      {/* Secondary Dashboard Sections */}
      <div className="dashboard-content-split">
        {/* Recent Transactions List */}
        <div className="dashboard-transactions-card card">
          <div className="card-header" style={{ marginBottom: "1.5rem" }}>
            <h3 className="section-title">Recent Transactions</h3>
            <Link to="/transactions" className="btn-link-action">
              <span>View All</span> <ArrowRight size={14} />
            </Link>
          </div>
          
          <TransactionTable 
            transactions={recentTransactions} 
            onEditExpense={handleEditExpense} 
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

        {/* Budget Progress Gauge */}
        <div className="dashboard-budget-card card">
          <h3 className="section-title" style={{ marginBottom: "1.5rem" }}>Monthly Budget Consumption</h3>
          
          {monthlyBudget > 0 ? (
            <div className="budget-progress-section">
              <div className="budget-progress-label-row">
                <span className="budget-spent-text">
                  Spent: <strong>{formatCurrency(currentMonthExpenses)}</strong>
                </span>
                <span className="budget-limit-text">
                  Limit: {formatCurrency(monthlyBudget)}
                </span>
              </div>

              <div className="progress-container" style={{ height: "12px", margin: "1rem 0" }}>
                <div 
                  className={`progress-bar ${
                    budgetPercentage >= 100 
                      ? 'progress-bar-danger' 
                      : budgetPercentage >= 80 
                        ? 'progress-bar-warning' 
                        : 'progress-bar-success'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>

              <div className="budget-summary-details">
                <div className="budget-detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-val badge ${
                    budgetPercentage >= 100 
                      ? 'badge-expense' 
                      : budgetPercentage >= 80 
                        ? 'badge-demo' 
                        : 'badge-income'
                  }`}>
                    {budgetPercentage >= 100 
                      ? 'Exceeded' 
                      : budgetPercentage >= 80 
                        ? 'Warning' 
                        : 'Healthy'}
                  </span>
                </div>
                
                <div className="budget-detail-item">
                  <span className="detail-label">Remaining Budget</span>
                  <span className={`detail-val ${monthlyBudget - currentMonthExpenses >= 0 ? 'color-success' : 'color-danger'}`} style={{ fontWeight: 700 }}>
                    {formatCurrency(monthlyBudget - currentMonthExpenses)}
                  </span>
                </div>

                <div className="budget-detail-item">
                  <span className="detail-label">Utilization</span>
                  <span className="detail-val" style={{ fontWeight: 600 }}>
                    {budgetPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-budget-configured">
              <Wallet className="no-budget-icon" />
              <p className="no-budget-title">No Monthly Budget Set</p>
              <p className="no-budget-desc">
                Configure a monthly spending budget to receive automated visual consumption alerts.
              </p>
              <Link to="/budget" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                Configure Budget
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showExpenseModal && (
        <ExpenseForm 
          onClose={() => {
            setShowExpenseModal(false);
            setExpenseToEdit(null);
          }}
          expenseToEdit={expenseToEdit}
        />
      )}

      {showIncomeModal && (
        <IncomeForm 
          onClose={() => setShowIncomeModal(false)}
        />
      )}

      <style>{`
        .dashboard-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-title-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .page-subtitle-heading {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .dashboard-action-btns {
          display: flex;
          gap: 0.75rem;
        }

        /* Layout columns split */
        .dashboard-content-split {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-link-action {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary);
          transition: var(--transition-fast);
        }

        .btn-link-action:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        /* Budget Card Details */
        .budget-progress-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .budget-summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .budget-detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .budget-detail-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .detail-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .color-success { color: var(--success-hover); }
        .color-danger { color: var(--danger); }

        /* Empty budget card state */
        .no-budget-configured {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--text-muted);
        }

        .no-budget-icon {
          width: 3rem;
          height: 3rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          stroke-width: 1.25;
        }

        .no-budget-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .no-budget-desc {
          font-size: 0.8125rem;
          line-height: 1.4;
          max-width: 240px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .dashboard-content-split {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .dashboard-action-btns {
            width: 100%;
          }
          .dashboard-action-btns button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
