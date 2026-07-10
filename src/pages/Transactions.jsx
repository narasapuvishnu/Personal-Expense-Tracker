import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import TransactionTable from "../components/TransactionTable";
import ExpenseForm from "../components/ExpenseForm";
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Plus, 
  FolderPlus, 
  Trash2,
  AlertCircle
} from "lucide-react";

export default function Transactions() {
  const {
    expenses,
    incomes,
    allCategories,
    customCategories,
    addCustomCategory,
    deleteCustomCategory,
    deleteExpense,
    deleteIncome,
    getYearMonthKey
  } = useExpenses();

  // Modal and state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // all, expense, income

  // Custom Category creation
  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");

  // Helper format months e.g. "2026-07" -> "July 2026"
  const formatMonthName = (monthKey) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Compile all transactions
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: "expense" })),
    ...incomes.map(i => ({ ...i, type: "income" }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Extract unique months for filtering dropdown
  const uniqueMonths = Array.from(
    new Set(allTransactions.map(tx => getYearMonthKey(tx.date)))
  ).filter(Boolean).sort((a, b) => new Date(b) - new Date(a)); // Sort descending

  // Filter transactions
  const filteredTransactions = allTransactions.filter(tx => {
    // Search filter
    const matchesSearch = 
      (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || tx.category === selectedCategory;

    // Month filter
    const matchesMonth = selectedMonth === "all" || getYearMonthKey(tx.date) === selectedMonth;

    // Type filter
    const matchesType = selectedType === "all" || tx.type === selectedType;

    return matchesSearch && matchesCategory && matchesMonth && matchesType;
  });

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

  const handleAddCustomCategory = async (e) => {
    e.preventDefault();
    setCatError("");
    const cleaned = newCatName.trim();
    if (!cleaned) return;

    try {
      await addCustomCategory(cleaned);
      setNewCatName("");
    } catch (err) {
      setCatError(err.message || "Failed to create category.");
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"? This will not delete transactions using this category, but it will be removed from your choices.`)) {
      try {
        await deleteCustomCategory(catName);
        if (selectedCategory === catName) {
          setSelectedCategory("all");
        }
      } catch (err) {
        alert(err.message || "Failed to delete category.");
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="transactions-header-row">
        <div>
          <h2 className="page-title-heading">Transaction Ledger</h2>
          <p className="page-subtitle-heading">Analyze, filter, and audit your financial records.</p>
        </div>
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

      {/* Filter and Content Layout */}
      <div className="transactions-grid-layout">
        {/* Main Ledger Content */}
        <div className="ledger-main card">
          {/* Controls Bar */}
          <div className="ledger-controls">
            {/* Search Input */}
            <div className="search-box">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search description or category..." 
                className="form-input search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Group */}
            <div className="filters-row">
              {/* Type Select */}
              <div className="filter-select-wrapper">
                <Filter className="filter-select-icon" />
                <select 
                  className="form-select select-styled" 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Incomes Only</option>
                </select>
              </div>

              {/* Category Select */}
              <div className="filter-select-wrapper">
                <Tag className="filter-select-icon" />
                <select 
                  className="form-select select-styled"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Month Select */}
              <div className="filter-select-wrapper">
                <Calendar className="filter-select-icon" />
                <select 
                  className="form-select select-styled"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {uniqueMonths.map(monthKey => (
                    <option key={monthKey} value={monthKey}>
                      {formatMonthName(monthKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Statistics summary of filtered items */}
          <div className="filtered-summary-bar">
            <span>Showing <strong>{filteredTransactions.length}</strong> transactions</span>
            <span className="summary-amount-badge">
              Net Filtered Flow:{" "}
              <strong className={
                filteredTransactions.reduce((acc, tx) => acc + (tx.type === "expense" ? -tx.amount : tx.amount), 0) >= 0 
                  ? 'color-success' 
                  : 'color-danger'
              }>
                ₹{filteredTransactions.reduce((acc, tx) => acc + (tx.type === "expense" ? -tx.amount : tx.amount), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <TransactionTable 
            transactions={filteredTransactions} 
            onEditExpense={handleEditExpense} 
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

        {/* Sidebar Manager */}
        <div className="ledger-sidebar">
          {/* Custom Category Creator */}
          <div className="card manager-card">
            <h3 className="sidebar-card-title">
              <FolderPlus size={18} className="sidebar-title-icon" />
              Custom Categories
            </h3>
            
            <form onSubmit={handleAddCustomCategory} className="category-form">
              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm btn-full">
                Add Category
              </button>
              {catError && <p className="custom-error-text">{catError}</p>}
            </form>

            <div className="custom-categories-list-header">
              <span>Your Custom Categories</span>
            </div>

            {customCategories.length === 0 ? (
              <div className="no-custom-cats-desc">
                <AlertCircle size={14} />
                <span>No custom categories added yet.</span>
              </div>
            ) : (
              <ul className="custom-cats-list">
                {customCategories.map(cat => (
                  <li key={cat} className="custom-cat-item">
                    <span>{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)} 
                      className="btn-delete-cat"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

      <style>{`
        .transactions-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .transactions-grid-layout {
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* Ledger controls bar layout */
        .ledger-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          width: 1.125rem;
          height: 1.125rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          padding-left: 2.75rem;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 0.75rem;
        }

        .filter-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-select-icon {
          position: absolute;
          left: 0.875rem;
          width: 1rem;
          height: 1rem;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 10;
        }

        .select-styled {
          padding-left: 2.25rem;
          background-color: var(--bg-app);
          font-size: 0.875rem;
        }

        .filtered-summary-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-app);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .summary-amount-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .color-success { color: var(--success-hover); }
        .color-danger { color: var(--danger); }

        /* Sidebar manager card */
        .sidebar-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .sidebar-title-icon {
          color: var(--primary);
        }

        .custom-categories-list-header {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.375rem;
        }

        .no-custom-cats-desc {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-style: italic;
          padding: 0.5rem 0;
        }

        .custom-cats-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .custom-cat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-app);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .btn-delete-cat {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 0.125rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
        }

        .btn-delete-cat:hover {
          color: var(--danger);
          background-color: var(--danger-light);
        }

        @media (max-width: 1024px) {
          .transactions-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .transactions-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .transactions-header-row button {
            width: 100%;
          }
          .ledger-controls {
            flex-direction: column;
          }
          .filters-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
