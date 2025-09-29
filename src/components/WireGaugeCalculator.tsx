import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../state/useAppStore';

// AWG chart with cross-sectional area in mm^2
const awgData = [
  { awg: 0, area: 53.48 }, { awg: 1, area: 42.41 }, { awg: 2, area: 33.63 },
  { awg: 3, area: 26.67 }, { awg: 4, area: 21.15 }, { awg: 5, area: 16.77 },
  { awg: 6, area: 13.30 }, { awg: 7, area: 10.55 }, { awg: 8, area: 8.37 },
  { awg: 10, area: 5.26 }, { awg: 12, area: 3.31 }, { awg: 14, area: 2.08 },
  { awg: 16, area: 1.31 }, { awg: 18, area: 0.823 },
];

function WireGaugeCalculator() {
  const selectedComponents = useAppStore(state => state.selectedComponents);
  const wiringEstimate = useAppStore(state => state.wiringEstimate);
  const totalRms = useMemo(
    () => selectedComponents.reduce((total, comp) => total + (comp.specs?.rms_wattage || 0), 0),
    [selectedComponents],
  );
  const [length, setLength] = useState<number>(10);
  const [wattage, setWattage] = useState<number>(totalRms);
  const [recommendedGauge, setRecommendedGauge] = useState<string>('N/A');
  const [recommendedFuse, setRecommendedFuse] = useState<string>('N/A');

  useEffect(() => {
    setWattage(totalRms);
  }, [totalRms]);

  useEffect(() => {
    if (wiringEstimate?.powerRunFeet) {
      setLength(wiringEstimate.powerRunFeet);
    }
  }, [wiringEstimate]);

  useEffect(() => {
    if (wattage > 0 && length > 0) {
      const amps = wattage / 13.8;
      const voltageDropTarget = 13.8 * 0.04;
      const resistivityOfCopper = 1.724e-8;
      const lengthInMeters = length * 0.3048;

      const requiredAreaM2 = (resistivityOfCopper * lengthInMeters * amps) / voltageDropTarget;
      const requiredAreaMm2 = requiredAreaM2 * 1e6;

      const suitableGauge = awgData.find(g => g.area >= requiredAreaMm2);

      if (suitableGauge) {
        setRecommendedGauge(`${suitableGauge.awg} AWG`);
      } else {
        setRecommendedGauge('Too large');
      }

      const fuseSize = Math.ceil(amps * 1.25 / 5) * 5;
      setRecommendedFuse(`${fuseSize}A`);
    } else {
      setRecommendedGauge('N/A');
      setRecommendedFuse('N/A');
    }
  }, [wattage, length]);

  return (
    <div className="wire-calculator">
      <h3>Power Wire Gauge Calculator</h3>
      <div className="calculator-inputs">
        <div className="input-group">
          <label>Total RMS Wattage</label>
          <input
            type="number"
            value={wattage}
            onChange={e => setWattage(Number(e.target.value))}
            className="wattage-input"
          />
        </div>
        <div className="input-group">
          <label>Wire Length (feet)</label>
          <div className="slider-group">
            <input
              type="range"
              min="1"
              max="30"
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              className="length-slider"
            />
            <input
              type="number"
              min="1"
              max="30"
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              className="length-input"
            />
          </div>
        </div>
      </div>
      <div className="calculator-result">
        <span>Recommended Gauge:</span>
        <strong>{recommendedGauge}</strong>
      </div>
      <div className="calculator-result fuse-result">
        <span>Recommended Fuse:</span>
        <strong>{recommendedFuse}</strong>
      </div>
    </div>
  );
}

export default WireGaugeCalculator;
