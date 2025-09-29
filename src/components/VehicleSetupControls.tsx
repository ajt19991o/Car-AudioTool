import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useAppStore } from '../state/useAppStore';

interface VehicleSetupControlsProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function VehicleSetupControls({ loading, error, onRetry }: VehicleSetupControlsProps) {
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const setVehicleSelection = useAppStore(state => state.setVehicleSelection);
  const modelOptions = useAppStore(state => state.modelOptions);

  const currentModelEntry = useMemo(() => {
    if (!vehicleSelection.model) return undefined;
    return modelOptions.find(option => option.model.toLowerCase() === vehicleSelection.model?.toLowerCase());
  }, [modelOptions, vehicleSelection.model]);

  const yearOptions = useMemo(() => currentModelEntry?.years ?? [], [currentModelEntry]);
  const trimOptions = useMemo(() => currentModelEntry?.trims ?? [], [currentModelEntry]);

  const handleModelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value;
    const matching = modelOptions.find(option => option.model === model);
    const years = matching?.years ?? [];
    setVehicleSelection({
      model,
      year: years.length > 0 ? String(years[years.length - 1]) : undefined,
      trim: matching?.trims && matching.trims.length > 0 ? matching.trims[0] : undefined,
    });
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVehicleSelection({ year: event.target.value || undefined });
  };

  const handleTrimChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVehicleSelection({ trim: event.target.value || undefined });
  };

  if (!vehicleSelection.make) {
    return null;
  }

  return (
    <div className="vehicle-setup">
      <div className="vehicle-setup-header">
        <h2>Vehicle Setup</h2>
        {loading && <span className="vehicle-setup-status">Loading models…</span>}
        {error && (
          <button type="button" className="vehicle-setup-error" onClick={onRetry}>
            {error} — Retry
          </button>
        )}
      </div>
      <div className="vehicle-selectors">
        <label>
          <span>Model</span>
          <select value={vehicleSelection.model ?? ''} onChange={handleModelChange} disabled={modelOptions.length === 0 || loading}>
            {(modelOptions.length === 0 || loading) && <option value="">{loading ? 'Loading…' : 'Select a model'}</option>}
            {modelOptions.map(option => (
              <option key={option.model} value={option.model}>{option.model}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Year</span>
          <select value={vehicleSelection.year ?? ''} onChange={handleYearChange} disabled={yearOptions.length === 0 || loading}>
            {yearOptions.length === 0 && <option value="">Select</option>}
            {yearOptions.map(year => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </label>
        {trimOptions.length > 0 && (
          <label>
            <span>Trim</span>
            <select value={vehicleSelection.trim ?? ''} onChange={handleTrimChange}>
              {trimOptions.map(trim => (
                <option key={trim} value={trim}>{trim}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

export default VehicleSetupControls;
