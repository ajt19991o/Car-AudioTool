
import { useState, useEffect } from 'react';

// Define the structure of a component
interface AudioComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  specs?: {
    size?: string;
  };
  purchase_links?: { vendor: string; url: string }[];
}

interface ComponentBrowserProps {
  onAddComponent: (component: AudioComponent) => void;
  vehicleSpecs: any;
}

const categories = ['All', 'Head Unit', 'Amplifier', 'Component Speakers', 'Coaxial Speakers', 'Subwoofer', 'DSP'];

function ComponentBrowser({ onAddComponent, vehicleSpecs }: ComponentBrowserProps) {
  const [components, setComponents] = useState<AudioComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    // Vehicle spec filter
    if (comp.type === 'speaker-set' && allowedSpeakerSizes && !allowedSpeakerSizes.includes(comp.specs?.size)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'All' && comp.category !== selectedCategory) {
      return false;
    }
    // Search term filter
    if (searchTerm && !comp.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="component-browser">
      <h3>Component Library</h3>
      <div className="filters">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {allowedSpeakerSizes && (
        <p className="filter-info">Showing speakers that fit your vehicle.</p>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="component-list">
        {filteredComponents.map(comp => (
          <div key={comp.id} className="component-item">
            <div className="component-info">
              <strong>{comp.name}</strong>
              <span>{comp.category}</span>
            </div>
            <div className="component-actions">
              <span>${comp.price.toFixed(2)}</span>
              <button 
                className="shop-button"
                disabled={!comp.purchase_links || comp.purchase_links.length === 0}
                onClick={() => window.open(comp.purchase_links[0].url, '_blank')}
              >
                Shop
              </button>
              <button onClick={() => onAddComponent(comp)}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponentBrowser;
