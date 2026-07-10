import React from "react";
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function TransactionTable({ 
  transactions, 
  onEditExpense, 
  onDeleteTransaction 
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">No transactions found matching your filters.</p>
        <style>{`
          .empty-state {
            padding: 3rem 1.5rem;
            text-align: center;
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            color: var(--text-muted);
          }
          .empty-state-text {
            font-size: 0.9375rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Format date to local readable format e.g. "Jul 10, 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isExpense = tx.type === "expense";
            return (
              <tr key={tx.id} className="table-row">
                <td className="cell-date">
                  {formatDate(tx.date)}
                </td>
                <td>
                  <span className={`badge ${isExpense ? 'badge-expense' : 'badge-income'}`}>
                    {isExpense ? (
                      <ArrowDownLeft className="badge-icon" />
                    ) : (
                      <ArrowUpRight className="badge-icon" />
                    )}
                    {tx.type}
                  </span>
                </td>
                <td className="cell-category">
                  <span className="category-tag">{tx.category}</span>
                </td>
                <td className="cell-description" title={tx.description}>
                  {tx.description || <span className="text-empty-desc">No description</span>}
                </td>
                <td className={`cell-amount ${isExpense ? 'amount-expense' : 'amount-income'}`}>
                  {isExpense ? "-" : "+"}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="cell-actions">
                  <div className="action-buttons-group">
                    {isExpense ? (
                      <button 
                        onClick={() => onEditExpense(tx)} 
                        className="btn-action-icon btn-edit"
                        title="Edit Expense"
                      >
                        <Edit2 size={15} />
                      </button>
                    ) : (
                      // Placeholder to balance columns
                      <div className="btn-action-icon-placeholder"></div>
                    )}
                    <button 
                      onClick={() => onDeleteTransaction(tx)} 
                      className="btn-action-icon btn-delete"
                      title="Delete Transaction"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .table-row {
          transition: var(--transition-fast);
        }

        .badge-icon {
          width: 0.8rem;
          height: 0.8rem;
          margin-right: 0.25rem;
        }

        .category-tag {
          font-weight: 600;
          font-size: 0.8125rem;
          color: var(--text-primary);
        }

        .text-empty-desc {
          color: var(--text-muted);
          font-style: italic;
          font-size: 0.8125rem;
        }

        .cell-description {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .amount-expense {
          color: var(--danger-hover);
          font-weight: 700;
        }

        .amount-income {
          color: var(--success-hover);
          font-weight: 700;
        }

        /* Action Buttons */
        .cell-actions {
          text-align: right;
        }

        .action-buttons-group {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-action-icon {
          background: none;
          border: 1px solid var(--border);
          padding: 0.375rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-fast);
        }

        .btn-action-icon-placeholder {
          width: 27px; /* Matches edit button width */
          height: 27px;
        }

        .btn-edit:hover {
          background-color: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary-focus);
        }

        .btn-delete:hover {
          background-color: var(--danger-light);
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.4);
        }

        /* Mobile specific adaptations */
        @media (max-width: 640px) {
          .cell-description {
            max-width: 120px;
          }
          .cell-date {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
