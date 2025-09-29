
import { useState, useEffect } from 'react';
import { type AudioComponent } from '../types';
import { useAppStore } from '../state/useAppStore';

interface ComponentBrowserProps {
  onComponentAdd?: (component: AudioComponent) => void;
}

const categories = ['All', 'Head Unit', 'Amplifier', 'Component Speakers', 'Coaxial Speakers', 'Subwoofer', 'DSP', 'Accessories'];

function ComponentBrowser({ onComponentAdd }: ComponentBrowserProps) {
  const [components, setComponents] = useState<AudioComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const addComponent = useAppStore(state => state.addComponent);
  const fitment = useAppStore(state => state.fitment);
  const vehicleSelection = useAppStore(state => state.vehicleSelection);

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

  const allowedSpeakerSizes = fitment?.speakers.map(item => item.size.toLowerCase()) ?? null;

  const filteredComponents = components.filter(comp => {
    // Vehicle spec filter
    if (comp.category.toLowerCase().includes('speaker') && allowedSpeakerSizes) {
      const size = comp.specs?.size?.toLowerCase();
      if (!size || !allowedSpeakerSizes.includes(size)) {
        return false;
      }
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
              {vehicleSelection.make && comp.category.toLowerCase().includes('speaker') && comp.specs?.size && (
                <small className="fitment-detail">Fits {vehicleSelection.make}: {comp.specs.size}</small>
              )}
            </div>
            <div className="component-actions">
              <span>${comp.price.toFixed(2)}</span>
              <button 
                className="shop-button"
                disabled={!comp.purchase_links || comp.purchase_links.length === 0}
                onClick={() => comp.purchase_links && window.open(comp.purchase_links[0].url, '_blank')}
              >
                Shop
              </button>
              <button
                onClick={() => {
                  addComponent(comp);
                  onComponentAdd?.(comp);
                }}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComponentBrowser;
