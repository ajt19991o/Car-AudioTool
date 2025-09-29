import { useMemo } from 'react';
import { useAppStore } from '../state/useAppStore';

function VehicleFitmentPanel() {
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const fitment = useAppStore(state => state.fitment);
  const wiringEstimate = useAppStore(state => state.wiringEstimate);

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

        {wiringEstimate && (
          <div className="fitment-wiring">
            <h4>Estimated Wiring Runs</h4>
            <dl>
              {typeof wiringEstimate.powerRunFeet === 'number' && (
                <div>
                  <dt>Power Wire</dt>
                  <dd>{wiringEstimate.powerRunFeet} ft</dd>
                </div>
              )}
              {typeof wiringEstimate.speakerRunFeet === 'number' && (
                <div>
                  <dt>Speaker Wire</dt>
                  <dd>{wiringEstimate.speakerRunFeet} ft</dd>
                </div>
              )}
              {typeof wiringEstimate.remoteTurnOnFeet === 'number' && (
                <div>
                  <dt>Remote Turn-On</dt>
                  <dd>{wiringEstimate.remoteTurnOnFeet} ft</dd>
                </div>
              )}
            </dl>
            {fitment?.wiringRunNotes && <p className="fitment-note">{fitment.wiringRunNotes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleFitmentPanel;
