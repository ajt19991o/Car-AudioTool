import type { VehicleModelOption } from '../types';

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const START_YEAR = 2000;
const REQUEST_DELAY_MS = 80;

interface NhtsaModelResponse {
  Results?: Array<{ Model_Name?: string }>;
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
