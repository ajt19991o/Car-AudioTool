
import { useState, useEffect } from 'react';

interface WireGaugeCalculatorProps {
  totalRms: number;
}

// Simplified AWG chart based on current and length for 4% voltage drop at 13.8V
// This is a data structure representing a standard lookup table.
const awgChart = [
  { amps: 20, gauges: [16, 14, 12, 12, 10, 10, 8] },
  { amps: 35, gauges: [12, 10, 8, 8, 6, 6, 4] },
  { amps: 50, gauges: [10, 8, 6, 6, 4, 4, 4] },
  { amps: 65, gauges: [8, 6, 4, 4, 4, 2, 2] },
  { amps: 85, gauges: [6, 4, 4, 2, 2, 2, 0] },
  { amps: 105, gauges: [4, 4, 2, 2, 0, 0, 0] },
  { amps: 125, gauges: [4, 2, 2, 0, 0, 0, 0] },
  { amps: 150, gauges: [2, 2, 0, 0, 0, 0, 0] },
];
const lengthBrackets = [4, 7, 10, 13, 16, 19, 22];

function WireGaugeCalculator({ totalRms }: WireGaugeCalculatorProps) {
  const [length, setLength] = useState<number>(10);
  const [wattage, setWattage] = useState<number>(totalRms);
  const [recommendedGauge, setRecommendedGauge] = useState<number | string>('N/A');

  useEffect(() => {
    setWattage(totalRms);
  }, [totalRms]);

  useEffect(() => {
    if (wattage > 0 && length > 0) {
      const amps = wattage / 13.8;
      
      const lengthIndex = lengthBrackets.findIndex(bracket => length <= bracket);
      if (lengthIndex === -1) {
        setRecommendedGauge('Too long');
        return;
      }

      const chartRow = awgChart.find(row => amps <= row.amps);
      if (!chartRow) {
        setRecommendedGauge('Too high');
        return;
      }

      setRecommendedGauge(`${chartRow.gauges[lengthIndex]} AWG`);
    } else {
      setRecommendedGauge('N/A');
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
    </div>
  );

export default WireGaugeCalculator;
