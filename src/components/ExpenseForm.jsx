import React, { useState, useEffect } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { X, Plus, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function ExpenseForm({ onClose, expenseToEdit = null }) {
  const { 
    allCategories, 
    addExpense, 
    updateExpense, 
    addCustomCategory 
  } = useExpenses();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  
  // Custom category creation state
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customError, setCustomError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount);
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setDescription(expenseToEdit.description || "");
    } else {
      // Default to today's date
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      if (allCategories.length > 0) {
        setCategory(allCategories[0]);
      }
    }
  }, [expenseToEdit, allCategories]);

  // Set default category when allCategories load
  useEffect(() => {
    if (!expenseToEdit && allCategories.length > 0 && !category) {
      setCategory(allCategories[0]);
    }
  }, [allCategories, category, expenseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid amount greater than 0.");
      return;
    }
    if (!category) {
      setFormError("Please select a category.");
      return;
    }
    if (!date) {
      setFormError("Please select a date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        amount: parseFloat(amount),
        category,
        date,
        description: description.trim()
      };

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, data);
      } else {
        await addExpense(data);
        // Small premium touch: confetti if it's a new item (but not too much to be annoying)
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#a5b4fc', '#818cf8']
        });
      }
      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCustomError("");

    if (!newCategoryName.trim()) {
      setCustomError("Category name cannot be empty.");
      return;
    }

    try {
      const addedCat = await addCustomCategory(newCategoryName);
      setCategory(addedCat); // Select the newly created category
      setNewCategoryName("");
      setShowCustomInput(false);
    } catch (err) {
      setCustomError(err.message || "Category already exists or failed to save.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {expenseToEdit ? "Edit Expense Entry" : "Record New Expense"}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="alert alert-danger" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                <div className="alert-content">
                  <p className="alert-title">{formError}</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Category Input */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="form-label" style={{ margin: 0 }}>Category</label>
                {!showCustomInput && (
                  <button 
                    type="button" 
                    onClick={() => setShowCustomInput(true)}
                    className="btn-text-action"
                  >
                    <Plus size={14} /> Add Custom
                  </button>
                )}
              </div>

              {!showCustomInput ? (
                <select 
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <div className="custom-category-box">
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Subscriptions"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory} 
                      className="btn btn-success btn-sm"
                    >
                      Create
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomError("");
                      }} 
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  {customError && <p className="custom-error-text">{customError}</p>}
                </div>
              )}
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Starbucks Latte, Uber, rent deposit..."
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : expenseToEdit ? "Save Changes" : "Record Expense"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .btn-text-action {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-text-action:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        .custom-category-box {
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-app);
          animation: fadeIn 0.2s ease-out;
        }

        .custom-error-text {
          font-size: 0.75rem;
          color: var(--danger);
          margin-top: 0.5rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
