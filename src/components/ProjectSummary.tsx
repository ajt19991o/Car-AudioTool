// Define the structure of a component
interface AudioComponent {
  id: string;
  name: string;
  price: number;
  specs: {
    rms_wattage?: number;
    peak_wattage?: number;
  };
}

interface ProjectSummaryProps {
  selectedComponents: AudioComponent[];
}

function ProjectSummary({ selectedComponents }: ProjectSummaryProps) {
  const totalCost = selectedComponents.reduce((total, comp) => total + comp.price, 0);
  const totalRms = selectedComponents.reduce((total, comp) => total + (comp.specs?.rms_wattage || 0), 0);
  const totalPeak = selectedComponents.reduce((total, comp) => total + (comp.specs?.peak_wattage || 0), 0);

  return (
    <div className="project-summary">
      <h3>Project Summary</h3>
      
      <div className="summary-item">
        <span>Total Cost:</span>
        <strong>${totalCost.toFixed(2)}</strong>
      </div>

      <div className="summary-item">
        <span>Total RMS Wattage:</span>
        <strong>{totalRms}W</strong>
      </div>

      <div className="summary-item">
        <span>Total Peak Wattage:</span>
        <strong>{totalPeak}W</strong>
      </div>

      <div className="selected-components-list">
        <h4>Selected Items:</h4>
        <ul>
          {selectedComponents.map((comp, index) => (
            <li key={`${comp.id}-${index}`}>{comp.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProjectSummary;