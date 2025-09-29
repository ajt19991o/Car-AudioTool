import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../state/useAppStore';

const WIRING_STORAGE_KEY = 'car-audio-wiring-overrides';

type WiringOverride = {
  powerRunFeet: number;
  speakerRunFeet: number;
  remoteTurnOnFeet: number;
};

type WiringOverridesMap = Record<string, WiringOverride>;

const createDefaultWiring = (): WiringOverride => ({
  powerRunFeet: 16,
  speakerRunFeet: 40,
  remoteTurnOnFeet: 14,
});

function VehicleFitmentPanel() {
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const fitment = useAppStore(state => state.fitment);
  const wiringEstimate = useAppStore(state => state.wiringEstimate);
  const wiringEstimateAuto = useAppStore(state => state.wiringEstimateAuto);
  const wiringEstimateSource = useAppStore(state => state.wiringEstimateSource);
  const setWiringEstimate = useAppStore(state => state.setWiringEstimate);
  const restoreAutoWiringEstimate = useAppStore(state => state.restoreAutoWiringEstimate);
  const upsertCustomSpeaker = useAppStore(state => state.upsertCustomSpeaker);
  const [overrides, setOverrides] = useState<WiringOverridesMap>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(WIRING_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'powerRunFeet' in parsed) {
        return {};
      }
      return parsed ?? {};
    } catch (error) {
      console.warn('Failed to parse stored wiring overrides', error);
      return {};
    }
  });

  const overrideKey = vehicleSelection.make && vehicleSelection.model
    ? `${vehicleSelection.make.toLowerCase()}::${vehicleSelection.model.toLowerCase()}`
    : null;

  const storedOverride = overrideKey ? overrides[overrideKey] : undefined;

  const effectiveEstimate = wiringEstimate
    ?? wiringEstimateAuto
    ?? storedOverride
    ?? createDefaultWiring();

  const persistOverrides = (next: WiringOverridesMap) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WIRING_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const applyManualOverride = (updated: WiringOverride) => {
    setWiringEstimate(updated, { source: 'manual' });
    if (!overrideKey) return;
    setOverrides(prev => {
      const next = { ...prev, [overrideKey]: updated };
      persistOverrides(next);
      return next;
    });
  };

  const handleManualChange = (field: 'powerRunFeet' | 'speakerRunFeet' | 'remoteTurnOnFeet') => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Math.max(1, Math.round(Number(event.target.value) || 0));
    const base = {
      ...createDefaultWiring(),
      ...(wiringEstimateAuto ?? {}),
      ...(storedOverride ?? {}),
      ...(wiringEstimate ?? {}),
    };
    const updated = { ...base, [field]: nextValue };
    applyManualOverride(updated);
  };

  useEffect(() => {
    if (!overrideKey) return;
    const saved = overrides[overrideKey];
    if (saved && wiringEstimateSource === 'auto') {
      setWiringEstimate(saved, { source: 'manual' });
    }
  }, [overrideKey, overrides, wiringEstimateSource, setWiringEstimate]);

  const speakerSummary = useMemo(() => {
    if (!fitment?.speakers) return [];
    return fitment.speakers.map(spec => ({
      location: spec.location,
      size: spec.size,
      isCustom: spec.isCustom,
    }));
  }, [fitment]);

  const [customSpeakerLocation, setCustomSpeakerLocation] = useState('');
  const [customSpeakerSize, setCustomSpeakerSize] = useState('');

  const handleCustomSpeakerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const location = customSpeakerLocation.trim();
    const size = customSpeakerSize.trim();
    if (!location || !size) return;
    upsertCustomSpeaker({ location, size, isCustom: true });
    setCustomSpeakerLocation('');
    setCustomSpeakerSize('');
  };

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
                <span>{item.size}{item.isCustom ? ' • custom' : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fitment-empty">Add speaker sizes manually to get wiring estimates.</p>
        )}

        <form className="fitment-custom-speaker" onSubmit={handleCustomSpeakerSubmit}>
          <h4>Add Speaker Size</h4>
          <div className="fitment-custom-grid">
            <label>
              <span>Location</span>
              <input
                type="text"
                value={customSpeakerLocation}
                onChange={(event) => setCustomSpeakerLocation(event.target.value)}
                placeholder="Front door"
                required
              />
            </label>
            <label>
              <span>Size</span>
              <input
                type="text"
                value={customSpeakerSize}
                onChange={(event) => setCustomSpeakerSize(event.target.value)}
                placeholder='6.5"'
                required
              />
            </label>
            <button type="submit">Add</button>
          </div>
        </form>

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
                onClick={() => {
                  restoreAutoWiringEstimate();
                  if (!overrideKey) return;
                  setOverrides(prev => {
                    const next = { ...prev };
                    delete next[overrideKey];
                    persistOverrides(next);
                    return next;
                  });
                }}
                disabled={!wiringEstimateAuto && !storedOverride}
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
