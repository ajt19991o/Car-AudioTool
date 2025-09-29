import type { VehicleModelOption } from '../types';

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const START_YEAR = 2000;
const REQUEST_DELAY_MS = 80;

interface NhtsaModelResponse {
  Results?: Array<{ Model_Name?: string }>;
}

interface NhtsaMakeResponse {
  Results?: Array<{ Make_Name?: string }>;
}

const modelCache = new Map<string, VehicleModelOption[]>();

const session = typeof window !== 'undefined' ? window.sessionStorage : undefined;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatModelName = (value: string) =>
  value
    .toLowerCase()
    .replace(/(^|[\s-\/])([a-z0-9])/g, (_, boundary, letter) => `${boundary}${letter.toUpperCase()}`)
    .replace(/\s+/g, ' ')
    .trim();

const getSessionKey = (make: string) => `nhtsa-models:${make.toLowerCase()}`;

const ALL_MAKES_CACHE_KEY = 'nhtsa-all-makes';

interface NhtsaMakeResponse {
  Results?: Array<{ Make_Name?: string }>;
}

export async function fetchAllMakes(): Promise<string[]> {
  if (session) {
    const stored = session.getItem(ALL_MAKES_CACHE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as string[];
      } catch (error) {
        session.removeItem(ALL_MAKES_CACHE_KEY);
      }
    }
  }

  const url = `${BASE_URL}/GetAllMakes?format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NHTSA responded with ${response.status}`);
    }
    const data = (await response.json()) as NhtsaMakeResponse;
    const makes = (data.Results ?? [])
      .map((result) => result.Make_Name?.trim())
      .filter((name): name is string => !!name)
      .map(formatModelName);

    if (session) {
      try {
        session.setItem(ALL_MAKES_CACHE_KEY, JSON.stringify(makes));
      } catch (error) {
        console.warn('Unable to store all makes cache in session storage', error);
      }
    }
    return makes;
  } catch (error) {
    console.error('Failed to fetch all makes:', error);
    return [];
  }
}

export async function fetchModelsForMake(make: string, startYear = START_YEAR): Promise<VehicleModelOption[]> {
  const cacheKey = make.toLowerCase();
  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }

  if (session) {
    const stored = session.getItem(getSessionKey(make));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as VehicleModelOption[];
        modelCache.set(cacheKey, parsed);
        return parsed;
      } catch (error) {
        session.removeItem(getSessionKey(make));
      }
    }
  }

  const currentYear = new Date().getFullYear();
  const modelYearMap = new Map<string, Set<number>>();

  for (let year = startYear; year <= currentYear; year += 1) {
    const url = `${BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NHTSA responded with ${response.status}`);
      }
      const data = (await response.json()) as NhtsaModelResponse;
      (data.Results ?? []).forEach((result) => {
        const rawName = result.Model_Name?.trim();
        if (!rawName) return;
        const formatted = formatModelName(rawName);
        if (!formatted) return;
        if (!modelYearMap.has(formatted)) {
          modelYearMap.set(formatted, new Set());
        }
        modelYearMap.get(formatted)!.add(year);
      });
    } catch (error) {
      console.warn(`Failed to load models for ${make} ${year}:`, error);
    }
    await wait(REQUEST_DELAY_MS);
  }

  if (modelYearMap.size === 0) {
    try {
      const fallbackUrl = `${BASE_URL}/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
      const response = await fetch(fallbackUrl);
      if (response.ok) {
        const data = (await response.json()) as NhtsaModelResponse;
        (data.Results ?? []).forEach((result) => {
          const rawName = result.Model_Name?.trim();
          if (!rawName) return;
          const formatted = formatModelName(rawName);
          if (!modelYearMap.has(formatted)) {
            modelYearMap.set(formatted, new Set());
          }
        });
      }
    } catch (error) {
      console.warn(`Fallback model fetch failed for ${make}:`, error);
    }
  }

  const models: VehicleModelOption[] = Array.from(modelYearMap.entries())
    .map(([model, years]) => ({
      model,
      years: years.size > 0 ? Array.from(years).sort((a, b) => a - b) : [],
      trims: [],
    }))
    .sort((a, b) => a.model.localeCompare(b.model));

  modelCache.set(cacheKey, models);
  if (session) {
    try {
      session.setItem(getSessionKey(make), JSON.stringify(models));
    } catch (error) {
      console.warn('Unable to store model cache in session storage', error);
    }
  }

  return models;
}

export async function fetchAllMakes(): Promise<string[]> {
  const url = `${BASE_URL}/GetAllMakes?format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NHTSA responded with ${response.status}`);
  }
  const data = (await response.json()) as NhtsaMakeResponse;
  return (data.Results ?? [])
    .map(result => result.Make_Name?.trim())
    .filter((name): name is string => Boolean(name && name.length > 0));
}
