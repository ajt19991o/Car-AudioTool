const fetch = require('node-fetch');
const fs = require('fs/promises');
const path = require('path');
const corporationMap = require('../data/corporationMap.json');

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const cacheFilePath = path.join(__dirname, '../data/vehicleCache.json');

let cachedVehicleData = null;
let cacheExpiresAt = 0;

// ensure familiar abbreviations remain uppercase when rendered
const alwaysUpperCase = new Set(['BMW', 'GMC', 'MINI', 'MG', 'RAM', 'BYD', 'AMG']);

const titleize = (value) => {
  const name = value.trim();
  if (!name) return name;
  const upper = name.toUpperCase();
  if (alwaysUpperCase.has(upper)) {
    return upper;
  }
  return name
    .toLowerCase()
    .replace(/(^|[\s-\/])([a-z])/g, (match, boundary, letter) => `${boundary}${letter.toUpperCase()}`);
};

const loadCacheFromDisk = async () => {
  try {
    const raw = await fs.readFile(cacheFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed.corporations;
  } catch (error) {
    return null;
  }
};

const writeCacheToDisk = async (corporations) => {
  const payload = {
    lastUpdated: new Date().toISOString(),
    expiresAt: Date.now() + CACHE_TTL_MS,
    corporations,
  };
  await fs.writeFile(cacheFilePath, JSON.stringify(payload, null, 2), 'utf8');
};

const normaliseMakeName = (value) => value.trim().toUpperCase();

const getVehicleData = async (req, res) => {
  if (cachedVehicleData && Date.now() < cacheExpiresAt) {
    return res.json(cachedVehicleData);
  }

  const diskCache = await loadCacheFromDisk();
  if (diskCache) {
    cachedVehicleData = diskCache;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return res.json(diskCache);
  }

  try {
    const response = await fetch(`${NHTSA_API_BASE}/GetMakesForVehicleType/car?format=json`);
    if (!response.ok) {
      throw new Error(`NHTSA responded with ${response.status}`);
    }

    const data = await response.json();
    const grouped = new Map();
    const independent = new Set();

    data.Results.forEach((make) => {
      const rawName = make.MakeName || make.Make_Name || '';
      if (!rawName) return;
      const normalized = normaliseMakeName(rawName);
      const corporation = corporationMap[normalized];

      if (!corporation) {
        independent.add(titleize(rawName));
        return;
      }

      if (!grouped.has(corporation)) {
        grouped.set(corporation, new Set());
      }

      grouped.get(corporation).add(titleize(rawName));
    });

    if (independent.size > 0) {
      const existing = grouped.get('Independent & Specialty') ?? new Set();
      independent.forEach(makeName => existing.add(makeName));
      grouped.set('Independent & Specialty', existing);
    }

    const vehicleData = Array.from(grouped.entries())
      .map(([corporation, makes]) => ({
        corporation,
        makes: Array.from(makes).sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.corporation.localeCompare(b.corporation));

    cachedVehicleData = vehicleData;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    await writeCacheToDisk(vehicleData);

    res.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle data:', error);

    if (cachedVehicleData) {
      return res.json(cachedVehicleData);
    }

    res.status(500).json({ error: 'Failed to fetch vehicle data' });
  }
};

module.exports = {
  getVehicleData,
};
