import React, { useState, useEffect } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export const INCOME_CATEGORIES = [
  "Salary",
  "Pocket Money",
  "Scholarship",
  "Freelancing",
  "Other Income"
];

export default function IncomeForm({ onClose }) {
  const { addIncome } = useExpenses();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Default to today's date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

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

      await addIncome(data);

      // Income Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6ee7b7', '#34d399']
      });

      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to save income. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Record Income Entry</h2>
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
              <label className="form-label">Income Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label className="form-label">Date Received</label>
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
                placeholder="e.g. Monthly salary, project bonus..."
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
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
