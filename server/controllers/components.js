const fs = require('fs/promises');
const path = require('path');

const componentsFilePath = path.join(__dirname, '../data/components.json');
const COMPONENT_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

let cachedComponents = null;
let cacheLoadedAt = 0;

const loadComponents = async () => {
  if (cachedComponents && Date.now() - cacheLoadedAt < COMPONENT_CACHE_TTL) {
    return cachedComponents;
  }

  const raw = await fs.readFile(componentsFilePath, 'utf8');
  cachedComponents = JSON.parse(raw);
  cacheLoadedAt = Date.now();
  return cachedComponents;
};

const toLower = (value) => (value || '').toString().toLowerCase();

const getComponents = async (req, res) => {
  try {
    const components = await loadComponents();
    const {
      category,
      type,
      q,
      tag,
      fits,
      limit = '50',
      maxPrice,
      minPrice,
    } = req.query;

    const searchTerms = toLower(q).split(/\s+/).filter(Boolean);
    const tagFilters = (tag ? tag.split(',') : []).map(value => value.trim().toLowerCase()).filter(Boolean);
    const fitSizes = (fits ? fits.split(',') : []).map(value => value.trim().toLowerCase()).filter(Boolean);
    const maxPriceValue = maxPrice ? Number(maxPrice) : undefined;
    const minPriceValue = minPrice ? Number(minPrice) : undefined;
    const limitValue = Math.min(Number(limit) || 50, 100);

    let results = components.filter((component) => {
      if (category && category !== 'All' && toLower(component.category) !== toLower(category)) {
        return false;
      }
      if (type && toLower(component.type) !== toLower(type)) {
        return false;
      }
      if (searchTerms.length > 0) {
        const haystack = [component.name, component.brand, component.description, ...(component.tags || [])]
          .map(toLower)
          .join(' ');
        const matchesAll = searchTerms.every((term) => haystack.includes(term));
        if (!matchesAll) return false;
      }
      if (tagFilters.length > 0) {
        const componentTags = (component.tags || []).map(toLower);
        if (!tagFilters.some(tagValue => componentTags.includes(tagValue))) {
          return false;
        }
      }
      if (fitSizes.length > 0) {
        if (component.fitment?.speakerSizes) {
          const available = component.fitment.speakerSizes.map(value => value.toLowerCase());
          if (!fitSizes.some(size => available.includes(size))) {
            return false;
          }
        } else if (component.category.toLowerCase().includes('speaker')) {
          return false; // speaker without explicit fitment should not show when filtering by size
        }
      }
      if (typeof maxPriceValue === 'number' && component.price > maxPriceValue) {
        return false;
      }
      if (typeof minPriceValue === 'number' && component.price < minPriceValue) {
        return false;
      }
      return true;
    });

    results = results.sort((a, b) => a.price - b.price);

    res.json(results.slice(0, limitValue));
  } catch (error) {
    console.error('Error loading components:', error);
    res.status(500).json({ message: 'Error reading component catalog' });
  }
};

module.exports = {
  getComponents,
};
