import { useMemo } from 'react';
import { useAppStore } from '../state/useAppStore';

function ProjectSummary() {
  const selectedComponents = useAppStore(state => state.selectedComponents);
  const budget = useAppStore(state => state.budget);

  const totals = useMemo(() => {
    const totalCost = selectedComponents.reduce((total, comp) => total + comp.price, 0);
    const totalRms = selectedComponents.reduce((total, comp) => total + (comp.specs?.rms_wattage || 0), 0);
    const totalPeak = selectedComponents.reduce((total, comp) => total + (comp.specs?.peak_wattage || 0), 0);
    return { totalCost, totalRms, totalPeak };
  }, [selectedComponents]);

  const budgetDelta = typeof budget.target === 'number' ? budget.target - totals.totalCost : null;

  return (
    <div className="project-summary">
      <h3>Project Summary</h3>
      <div className="summary-stats">
        <div className="summary-item">
          <span>Total Cost:</span>
          <strong>${totals.totalCost.toFixed(2)}</strong>
        </div>

        <div className="summary-item">
          <span>Total RMS Wattage:</span>
          <strong>{totals.totalRms}W</strong>
        </div>

        <div className="summary-item">
          <span>Total Peak Wattage:</span>
          <strong>{totals.totalPeak}W</strong>
        </div>

        {budgetDelta !== null && (
          <div className={`summary-item ${budgetDelta < 0 ? 'over-budget' : ''}`}>
            <span>Budget Remaining:</span>
            <strong>{budgetDelta < 0 ? `-$${Math.abs(budgetDelta).toFixed(2)}` : `$${budgetDelta.toFixed(2)}`}</strong>
          </div>
        )}
      </div>

      <div className="selected-components-list">
        <h4>Selected Items:</h4>
        {selectedComponents.length > 0 ? (
          <ul>
            {selectedComponents.map((comp) => (
              <li key={comp.id}>{comp.name}</li>
            ))}
          </ul>
        ) : (
          <p className="no-items-message">No components added yet.</p>
        )}
      </div>
    </div>
  );
}

export default ProjectSummary;
