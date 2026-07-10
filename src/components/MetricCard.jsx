import React from "react";

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  variant = "primary" 
}) {
  return (
    <div className={`metric-card card border-variant-${variant}`}>
      <div className="metric-card-content">
        <p className="metric-card-title">{title}</p>
        <h3 className="metric-card-value">{value}</h3>
        {subtext && <p className="metric-card-subtext">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`metric-card-icon-wrapper variant-${variant}`}>
          <Icon className="metric-card-icon" />
        </div>
      )}

      <style>{`
        .metric-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }

        .metric-card-content {
          flex: 1;
        }

        .metric-card-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .metric-card-value {
          font-size: 1.875rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 0.375rem;
          letter-spacing: -0.02em;
        }

        .metric-card-subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Icon wrapper style variations */
        .metric-card-icon-wrapper {
          padding: 0.625rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .metric-card-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Border highlights based on variants */
        .border-variant-primary:hover { border-color: var(--primary-focus); }
        .border-variant-success:hover { border-color: var(--success); }
        .border-variant-danger:hover { border-color: var(--danger); }
        .border-variant-warning:hover { border-color: var(--warning); }
        .border-variant-info:hover { border-color: var(--info); }

        /* Variant Color Mappings */
        .variant-primary {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        
        .variant-success {
          background-color: var(--success-light);
          color: var(--success-hover);
        }
        
        .variant-danger {
          background-color: var(--danger-light);
          color: var(--danger-hover);
        }
        
        .variant-warning {
          background-color: var(--warning-light);
          color: var(--warning-hover);
        }
        
        .variant-info {
          background-color: var(--info-light);
          color: var(--info);
        }

        .variant-neutral {
          background-color: var(--bg-app);
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
