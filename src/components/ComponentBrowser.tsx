import { useEffect, useMemo, useState } from 'react';
import type { AudioComponent } from '../types';
import { useAppStore } from '../state/useAppStore';

interface ComponentBrowserProps {
  onComponentAdd?: (component: AudioComponent) => void;
}

const categories = [
  'All',
  'Head Unit',
  'Amplifier',
  'Component Speakers',
  'Coaxial Speakers',
  'Subwoofer',
  'DSP',
  'Wiring & Installation',
  'Accessories',
];

const tagOptions = [
  'budget',
  'hi-res',
  'carplay',
  'android-auto',
  'factory-integration',
  'integration',
  'maestro',
  'component',
  'coaxial',
  'dsp',
  'shallow',
  'truck',
  'sound-deadening',
  'remote',
  'silk-tweeter'
];

const formatSpecsSummary = (component: AudioComponent) => {
  if (!component.specs) return null;
  const { specs } = component;
  const details: string[] = [];

  if (specs.size) details.push(specs.size);
  if (specs.channels) details.push(`${specs.channels}ch`);
  if (specs.rms_wattage) details.push(`${specs.rms_wattage}W RMS`);
  if (specs.impedance) details.push(specs.impedance);
  if (specs.awg) details.push(`${specs.awg} AWG`);
  if (specs.length && !specs.size) details.push(specs.length);

  if (details.length === 0) return null;
  return details.join(' • ');
};

function ComponentBrowser({ onComponentAdd }: ComponentBrowserProps) {
  const [components, setComponents] = useState<AudioComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const addComponent = useAppStore(state => state.addComponent);
  const fitment = useAppStore(state => state.fitment);
  const vehicleSelection = useAppStore(state => state.vehicleSelection);

  const allowedSpeakerSizes = useMemo(() => {
    if (!fitment?.speakers) return [] as string[];
    const sizes = fitment.speakers
      .map(spec => spec.size.toLowerCase())
      .filter((value, index, array) => array.indexOf(value) === index);
    return sizes;
  }, [fitment]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }
    if (allowedSpeakerSizes.length > 0) {
      params.set('fits', allowedSpeakerSizes.join(','));
    }
    if (minPrice.trim()) {
      params.set('minPrice', minPrice.trim());
    }
    if (maxPrice.trim()) {
      params.set('maxPrice', maxPrice.trim());
    }
    if (selectedTags.length > 0) {
      params.set('tag', selectedTags.join(','));
    }
    params.set('limit', '60');

    setLoading(true);
    setError(null);

    fetch(`http://localhost:3001/api/components?${params.toString()}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: AudioComponent[]) => {
        setComponents(data);
        setLoading(false);
      })
      .catch(fetchError => {
        if (controller.signal.aborted) return;
        console.error('Error fetching components:', fetchError);
        setError('Failed to load components.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedCategory, searchTerm, allowedSpeakerSizes, minPrice, maxPrice, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]
    );
  };

  return (
    <div className="component-browser">
      <h3>Component Library</h3>
      <div className="filters">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="category-select">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="filters filters--secondary">
        <div className="price-filter">
          <label>
            <span>Min Price</span>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>
          <label>
            <span>Max Price</span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
        </div>
        <div className="tag-filter">
          <span>Tags</span>
          <div className="tag-chips">
            {tagOptions.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`tag-chip ${isActive ? 'tag-chip--active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {allowedSpeakerSizes.length > 0 && (
        <p className="filter-info">
          Matching speaker sizes: {allowedSpeakerSizes.join(', ').toUpperCase()}
        </p>
      )}
      {loading && <p>Loading catalog...</p>}
      {error && <p className="error">{error}</p>}
      <div className="component-list">
        {components.map(comp => {
          const specSummary = formatSpecsSummary(comp);
          const fitmentDetails = comp.fitment?.speakerSizes?.join(', ');
          const primaryLink = comp.purchase_links?.[0];
          return (
            <div key={comp.id} className="component-item">
              <div className="component-info">
                <strong>{comp.brand ? `${comp.brand} ${comp.name}` : comp.name}</strong>
                <span>{comp.category}</span>
                {specSummary && <small className="component-specs">{specSummary}</small>}
                {comp.description && <p className="component-description">{comp.description}</p>}
                {vehicleSelection.make && fitmentDetails && comp.category.toLowerCase().includes('speaker') && (
                  <small className="fitment-detail">Fits {vehicleSelection.make}: {fitmentDetails}</small>
                )}
                {comp.tags && comp.tags.length > 0 && (
                  <div className="component-tags">
                    {comp.tags.slice(0, 4).map(tag => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="component-actions">
                <span>${comp.price.toFixed(2)}</span>
                <button
                  className="shop-button"
                  disabled={!primaryLink}
                  onClick={() => primaryLink && window.open(primaryLink.url, '_blank', 'noopener')}
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
          );
        })}
        {!loading && components.length === 0 && !error && (
          <p className="empty-message">No components match your filters yet.</p>
        )}
      </div>
    </div>
  );
}

export default ComponentBrowser;
