import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useAppStore } from '../state/useAppStore';

function VehicleFitmentPanel() {
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const fitment = useAppStore(state => state.fitment);
  const wiringEstimate = useAppStore(state => state.wiringEstimate);
  const wiringEstimateAuto = useAppStore(state => state.wiringEstimateAuto);
  const wiringEstimateSource = useAppStore(state => state.wiringEstimateSource);
  const setWiringEstimate = useAppStore(state => state.setWiringEstimate);
  const restoreAutoWiringEstimate = useAppStore(state => state.restoreAutoWiringEstimate);

  const effectiveEstimate = wiringEstimate ?? wiringEstimateAuto;

  const handleManualChange = (field: 'powerRunFeet' | 'speakerRunFeet' | 'remoteTurnOnFeet') => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Math.max(1, Math.round(Number(event.target.value) || 0));
    const base = {
      powerRunFeet: effectiveEstimate?.powerRunFeet ?? 16,
      speakerRunFeet: effectiveEstimate?.speakerRunFeet ?? 40,
      remoteTurnOnFeet: effectiveEstimate?.remoteTurnOnFeet ?? 14,
    };
    const updated = { ...base, [field]: nextValue };
    setWiringEstimate(updated, { source: 'manual' });
  };

  const speakerSummary = useMemo(() => {
    if (!fitment?.speakers) return [] as { location: string; size: string }[];
    return fitment.speakers.map(spec => ({
      location: spec.location,
      size: spec.size,
    }));
  }, [fitment]);

  if (!vehicleSelection.make) {
    return (
      <div className="fitment-panel">
        <h3>Vehicle Fitment</h3>
        <p>Select a vehicle to view recommended speaker sizes and wiring runs.</p>
      </div>
    );
  }

  return (
    <div className="fitment-panel">
      <h3>Vehicle Fitment</h3>
      <div className="fitment-details">
        <div className="fitment-header">
          <span className="fitment-vehicle">{vehicleSelection.make}{vehicleSelection.model ? ` • ${vehicleSelection.model}` : ''}</span>
          {vehicleSelection.year && <span className="fitment-year">{vehicleSelection.year}</span>}
        </div>

        {speakerSummary.length > 0 ? (
          <ul className="fitment-speakers">
            {speakerSummary.map(item => (
              <li key={`${item.location}-${item.size}`}>
                <strong>{item.location.replace(/_/g, ' ')}</strong>
                <span>{item.size}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fitment-empty">Add factory speaker data to see required sizes.</p>
        )}

        {effectiveEstimate && (
          <div className="fitment-wiring">
            <h4>Estimated Wiring Runs</h4>
            <dl>
              <div>
                <dt>Power Wire</dt>
                <dd>{effectiveEstimate.powerRunFeet} ft</dd>
              </div>
              <div>
                <dt>Speaker Wire</dt>
                <dd>{effectiveEstimate.speakerRunFeet} ft</dd>
              </div>
              <div>
                <dt>Remote Turn-On</dt>
                <dd>{effectiveEstimate.remoteTurnOnFeet} ft</dd>
              </div>
            </dl>
            {fitment?.wiringRunNotes && <p className="fitment-note">{fitment.wiringRunNotes}</p>}
            <div className="fitment-wiring-adjust">
              <div>
                <label htmlFor="power-run-input">Power (ft)</label>
                <input
                  id="power-run-input"
                  type="number"
                  min={1}
                  value={wiringEstimate?.powerRunFeet ?? effectiveEstimate.powerRunFeet}
                  onChange={handleManualChange('powerRunFeet')}
                />
              </div>
              <div>
                <label htmlFor="speaker-run-input">Speaker (ft)</label>
                <input
                  id="speaker-run-input"
                  type="number"
                  min={1}
                  value={wiringEstimate?.speakerRunFeet ?? effectiveEstimate.speakerRunFeet}
                  onChange={handleManualChange('speakerRunFeet')}
                />
              </div>
              <div>
                <label htmlFor="remote-run-input">Remote (ft)</label>
                <input
                  id="remote-run-input"
                  type="number"
                  min={1}
                  value={wiringEstimate?.remoteTurnOnFeet ?? effectiveEstimate.remoteTurnOnFeet}
                  onChange={handleManualChange('remoteTurnOnFeet')}
                />
              </div>
            </div>
            <div className="fitment-wiring-controls">
              <span className="fitment-wiring-source">{wiringEstimateSource === 'manual' ? 'Custom lengths applied' : 'Using vehicle estimate'}</span>
              <button
                type="button"
                className="reset-wiring-button"
                onClick={restoreAutoWiringEstimate}
                disabled={!wiringEstimateAuto}
              >
                Reset to vehicle estimate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleFitmentPanel;
