import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useAppStore } from '../state/useAppStore';

interface VehicleSetupControlsProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function VehicleSetupControls({ loading, error, onRetry }: VehicleSetupControlsProps) {
  const corporations = useAppStore(state => state.corporations);
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const setVehicleSelection = useAppStore(state => state.setVehicleSelection);
  const modelOptions = useAppStore(state => state.modelOptions);

  const handleCorporationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const corpName = event.target.value;
    setVehicleSelection({
      corporation: corpName,
      make: undefined,
      model: undefined,
      year: undefined,
      trim: undefined,
    });
  };

  const handleMakeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const make = event.target.value;
    setVehicleSelection({
      make,
      model: undefined,
      year: undefined,
      trim: undefined,
    });
  };

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

  const makeOptions = useMemo(() => {
    if (!vehicleSelection.corporation) return [];
    const corp = corporations.find(c => c.corporation === vehicleSelection.corporation);
    return corp?.makes ?? [];
  }, [corporations, vehicleSelection.corporation]);

  const currentModelEntry = useMemo(() => {
    if (!vehicleSelection.model) return undefined;
    return modelOptions.find(option => option.model.toLowerCase() === vehicleSelection.model?.toLowerCase());
  }, [modelOptions, vehicleSelection.model]);

  const yearOptions = useMemo(() => currentModelEntry?.years ?? [], [currentModelEntry]);

  return (
    <div className="vehicle-setup">
      <div className="vehicle-setup-header">
        <h2>Vehicle Setup</h2>
        {loading && <span className="vehicle-setup-status">Loading...</span>}
        {error && (
          <button type="button" className="vehicle-setup-error" onClick={onRetry}>
            {error} — Retry
          </button>
        )}
      </div>
      <div className="vehicle-selectors">
        <label>
          <span>Corporation</span>
          <select value={vehicleSelection.corporation ?? ''} onChange={handleCorporationChange} disabled={corporations.length === 0}>
            <option value="">Select Corporation</option>
            {corporations.map(corp => (
              <option key={corp.corporation} value={corp.corporation}>{corp.corporation}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Make</span>
          <select value={vehicleSelection.make ?? ''} onChange={handleMakeChange} disabled={!vehicleSelection.corporation}>
            <option value="">Select Make</option>
            {makeOptions.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Model</span>
          <select value={vehicleSelection.model ?? ''} onChange={handleModelChange} disabled={modelOptions.length === 0 || loading || !vehicleSelection.make}>
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
      </div>
    </div>
  );
}

export default VehicleSetupControls;
