import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAppStore } from '../state/useAppStore';

export function BudgetPlanner() {
  const budget = useAppStore(state => state.budget);
  const updateBudget = useAppStore(state => state.updateBudget);
  const [targetInput, setTargetInput] = useState(() => budget.target ?? 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateBudget({ target: Number(targetInput) || 0 });
  };

  return (
    <div className="budget-panel">
      <h3>Budget Planner</h3>
      <form onSubmit={handleSubmit} className="budget-form">
        <label htmlFor="budget-target">Target Budget ($)</label>
        <input
          id="budget-target"
          type="number"
          min="0"
          value={targetInput}
          onChange={event => setTargetInput(Number(event.target.value))}
        />
        <button type="submit">Update Budget</button>
      </form>
      <div className="budget-breakdown">
        <span>Components:</span>
        <strong>${budget.componentTotal.toFixed(2)}</strong>
      </div>
      <div className="budget-breakdown">
        <span>Wiring:</span>
        <strong>${budget.wiringTotal.toFixed(2)}</strong>
      </div>
      <div className="budget-breakdown">
        <span>Accessories:</span>
        <strong>${budget.accessoriesTotal.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export function TutorialsPanel() {
  const guideChapters = useAppStore(state => state.guideChapters);
  const setView = useAppStore(state => state.setView);
  const preview = guideChapters.slice(0, 3);

  return (
    <div className="tutorials-panel">
      <h3>Guides & Tutorials</h3>
      <p className="tutorials-panel__intro">Highlights curated from the Car Audio &amp; AV Bible.</p>
      <ul>
        {preview.map(chapter => (
          <li key={chapter.id}>
            <strong>{chapter.title}</strong>
            <p>{chapter.summary}</p>
            <div className="tutorials-panel__tags">
              {chapter.sections.slice(0, 2).map(section => (
                <span key={section.id}>{section.title.replace(/Section \d+\.\d+ · /, '')}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="tutorials-panel__cta" onClick={() => setView('learn')}>
        Open Guide Hub
      </button>
    </div>
  );
}

export function SafetyChecklistPanel() {
  const safetyChecks = useAppStore(state => state.safetyChecks);
  const hasIssues = useMemo(() => safetyChecks.some(issue => issue.severity !== 'info'), [safetyChecks]);

  return (
    <div className={`safety-panel ${hasIssues ? 'safety-panel--alert' : ''}`}>
      <h3>Safety Checks</h3>
      <ul>
        {safetyChecks.map(issue => (
          <li key={issue.id} className={`safety-item safety-item--${issue.severity}`}>
            <span>{issue.message}</span>
          </li>
        ))}
        {safetyChecks.length === 0 && <p>All systems look good. Add components to run diagnostics.</p>}
      </ul>
    </div>
  );
}
