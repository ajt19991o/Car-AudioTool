import { useMemo, useState } from 'react';
import type { AudioComponent } from '../types';
import { useAppStore } from '../state/useAppStore';
import componentsData from '../data/components.json';

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

const componentCatalog = componentsData as AudioComponent[];

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

  const filteredComponents = useMemo(() => {
    const searchTerms = searchTerm
      .toLowerCase()
      .split(/\s+/)
      .map(term => term.trim())
      .filter(Boolean);

    const min = minPrice.trim() ? Number(minPrice) : undefined;
    const max = maxPrice.trim() ? Number(maxPrice) : undefined;
    const tagFilters = selectedTags.map(tag => tag.toLowerCase());

    return componentCatalog
      .filter((component) => {
        if (selectedCategory !== 'All' && component.category !== selectedCategory) {
          return false;
        }

        if (allowedSpeakerSizes.length > 0 && component.category.toLowerCase().includes('speaker')) {
          const size = component.specs?.size?.toLowerCase();
          if (!size || !allowedSpeakerSizes.includes(size)) {
            return false;
          }
        }

        if (typeof min === 'number' && !Number.isNaN(min) && component.price < min) {
          return false;
        }

        if (typeof max === 'number' && !Number.isNaN(max) && component.price > max) {
          return false;
        }

        if (tagFilters.length > 0) {
          const componentTags = (component.tags || []).map(tag => tag.toLowerCase());
          if (!tagFilters.some(tag => componentTags.includes(tag))) {
            return false;
          }
        }

        if (searchTerms.length > 0) {
          const haystack = [component.name, component.brand, component.description, ...(component.tags || [])]
            .map(value => (value || '').toString().toLowerCase())
            .join(' ');
          const matchesAll = searchTerms.every(term => haystack.includes(term));
          if (!matchesAll) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 60);
  }, [allowedSpeakerSizes, maxPrice, minPrice, searchTerm, selectedCategory, selectedTags]);

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
      <div className="component-list">
        {filteredComponents.map(comp => {
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
        {filteredComponents.length === 0 && (
          <p className="empty-message">No components match your filters yet.</p>
        )}
      </div>
    </div>
  );
}

export default ComponentBrowser;
