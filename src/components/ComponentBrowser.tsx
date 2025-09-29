
import { useState, useEffect } from 'react';

// Define the structure of a component
interface AudioComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
}

interface ComponentBrowserProps {
  onAddComponent: (component: AudioComponent) => void;
  vehicleSpecs: any;
}

function ComponentBrowser({ onAddComponent, vehicleSpecs }: ComponentBrowserProps) {
  const [components, setComponents] = useState<AudioComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/components')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setComponents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching components:', error);
        setError('Failed to load components.');
        setLoading(false);
      });
  }, []);

  const allowedSpeakerSizes = vehicleSpecs ? Object.values(vehicleSpecs.speakers) : null;

  const filteredComponents = components.filter(comp => {
    if (comp.type !== 'speaker-set' || !allowedSpeakerSizes) {
      return true; // Always show non-speakers or if no specs are loaded
    }
    return allowedSpeakerSizes.includes(comp.specs?.size);
  });

  return (
    <div className="component-browser">
      <h3>Component Library</h3>
      {allowedSpeakerSizes && (
        <p className="filter-info">Showing speakers that fit your vehicle.</p>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="component-list">
        {filteredComponents.map(comp => (
          <div key={comp.id} className="component-item">
            <strong>{comp.name}</strong>
            <span>{comp.category}</span>
            <span>${comp.price.toFixed(2)}</span>
            <button onClick={() => onAddComponent(comp)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponentBrowser;
