import { create } from 'zustand';
import type {
  AudioComponent,
  VehicleCorporation,
  VehicleModelOption,
  GuideChapter,
  GuideResource,
} from '../types';
import { guideChapters, guideResources } from '../data/guideContent';

const LIBRARY_STORAGE_KEY = 'planner-component-library';

const defaultLibrary: LibraryComponent[] = [
  { id: 'lib-amp', name: 'Amplifier', type: 'amplifier', category: 'Power' },
  { id: 'lib-sub', name: 'Subwoofer', type: 'subwoofer', category: 'Low Frequency' },
  { id: 'lib-speaker', name: 'Door Speaker', type: 'speaker-set', category: 'Mid/High' },
  { id: 'lib-dsp', name: 'DSP/Processor', type: 'dsp', category: 'Signal' },
  { id: 'lib-wiring', name: 'Power Wiring Kit', type: 'wiring', category: 'Power Distribution' },
];

function getInitialLibraryComponents(): LibraryComponent[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as LibraryComponent[];
      }
    } catch (error) {
      console.warn('Failed to read component library from storage', error);
      window.localStorage.removeItem(LIBRARY_STORAGE_KEY);
    }
  }
  return defaultLibrary;
}

function persistLibrary(components: LibraryComponent[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(components));
  } catch (error) {
    console.warn('Failed to persist component library', error);
  }
}

function calculateBudgetTotals(components: AudioComponent[]) {
  let componentTotal = 0;
  let wiringTotal = 0;
  let accessoriesTotal = 0;

  components.forEach((component) => {
    const price = component.price ?? 0;
    const category = (component.category || '').toLowerCase();
    const type = (component.type || '').toLowerCase();

    if (type.includes('wiring') || category.includes('wiring') || category.includes('installation')) {
      wiringTotal += price;
    } else if (type.includes('accessor') || category.includes('accessor')) {
      accessoriesTotal += price;
    } else {
      componentTotal += price;
    }
  });

  return {
    componentTotal,
    wiringTotal,
    accessoriesTotal,
  };
}

type AppView = 'home' | 'vehicle-selection' | 'project' | 'learn' | 'diagram-lab';

type Theme = 'light' | 'dark';

export interface LibraryComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  notes?: string;
  isCustom?: boolean;
}

interface VehicleSelection {
  corporation?: string;
  make?: string;
  model?: string;
  year?: string;
  trim?: string;
}

interface FitmentDetail {
  location: string;
  size: string;
  depthLimit?: string;
  isCustom?: boolean;
}

interface FitmentInfo {
  speakers: FitmentDetail[];
  wiringRunNotes?: string;
}

interface WiringRunEstimate {
  powerRunFeet?: number;
  speakerRunFeet?: number;
  remoteTurnOnFeet?: number;
}

interface BudgetState {
  target?: number;
  componentTotal: number;
  wiringTotal: number;
  accessoriesTotal: number;
}

interface SafetyCheckIssue {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface AppState {
  view: AppView;
  vehicleSelection: VehicleSelection;
  corporations: VehicleCorporation[];
  makes: string[];
  modelOptions: VehicleModelOption[];
  libraryComponents: LibraryComponent[];
  theme: Theme;
  fitment?: FitmentInfo;
  wiringEstimate?: WiringRunEstimate;
  wiringEstimateAuto?: WiringRunEstimate;
  wiringEstimateSource: 'auto' | 'manual';
  selectedComponents: AudioComponent[];
  guideChapters: GuideChapter[];
  guideResources: GuideResource[];
  safetyChecks: SafetyCheckIssue[];
  budget: BudgetState;
  setView: (view: AppView) => void;
  setCorporations: (data: VehicleCorporation[]) => void;
  setMakes: (makes: string[]) => void;
  setModelOptions: (options: VehicleModelOption[]) => void;
  addLibraryComponent: (component: LibraryComponent) => void;
  removeLibraryComponent: (id: string) => void;
  updateLibraryComponent: (id: string, updates: Partial<Omit<LibraryComponent, 'id'>>) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setVehicleSelection: (selection: Partial<VehicleSelection>) => void;
  resetVehicleSelection: () => void;
  setFitment: (fitment?: FitmentInfo) => void;
  upsertCustomSpeaker: (detail: FitmentDetail) => void;
  setWiringEstimate: (estimate?: WiringRunEstimate, options?: { source?: 'auto' | 'manual' }) => void;
  restoreAutoWiringEstimate: () => void;
  addComponent: (component: AudioComponent) => void;
  removeComponent: (id: string) => void;
  setComponents: (components: AudioComponent[]) => void;
  setSafetyChecks: (issues: SafetyCheckIssue[]) => void;
  updateBudget: (budget: Partial<BudgetState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  vehicleSelection: {},
  corporations: [],
  makes: [],
  modelOptions: [],
  libraryComponents: getInitialLibraryComponents(),
  theme: 'light',
  fitment: undefined,
  wiringEstimate: undefined,
  wiringEstimateAuto: undefined,
  wiringEstimateSource: 'auto',
  selectedComponents: [],
  guideChapters,
  guideResources,
  safetyChecks: [],
  budget: {
    target: undefined,
    componentTotal: 0,
    wiringTotal: 0,
    accessoriesTotal: 0,
  },
  setView: (view) => set({ view }),
  setCorporations: (data) => set({ corporations: data }),
  setMakes: (makes) => set({ makes }),
  setModelOptions: (options) => set({ modelOptions: options }),
  addLibraryComponent: (component) =>
    set((state) => {
      const next = [...state.libraryComponents, component];
      persistLibrary(next);
      return { libraryComponents: next };
    }),
  removeLibraryComponent: (id) =>
    set((state) => {
      const next = state.libraryComponents.filter(component => component.id !== id || !component.isCustom);
      persistLibrary(next);
      return { libraryComponents: next };
    }),
  updateLibraryComponent: (id, updates) =>
    set((state) => {
      const next = state.libraryComponents.map((component) => {
        if (component.id !== id || !component.isCustom) {
          return component;
        }
        const updated = { ...component, ...updates };
        return updated;
      });
      persistLibrary(next);
      return { libraryComponents: next };
    }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setVehicleSelection: (selection) =>
    set((state) => ({ vehicleSelection: { ...state.vehicleSelection, ...selection } })),
  resetVehicleSelection: () =>
    set({
      vehicleSelection: {},
      fitment: undefined,
      wiringEstimate: undefined,
      wiringEstimateAuto: undefined,
      wiringEstimateSource: 'auto',
      selectedComponents: [],
      safetyChecks: [],
      budget: {
        target: undefined,
        componentTotal: 0,
        wiringTotal: 0,
        accessoriesTotal: 0,
      },
      modelOptions: [],
    }),
  setFitment: (fitment) => set({ fitment }),
  upsertCustomSpeaker: (detail) =>
    set((state) => {
      const speakers = state.fitment?.speakers ?? [];
      const existingIndex = speakers.findIndex(item => item.location.toLowerCase() === detail.location.toLowerCase());
      const nextSpeakers = existingIndex >= 0
        ? speakers.map((item, index) => (index === existingIndex ? { ...item, ...detail, isCustom: true } : item))
        : [...speakers, { ...detail, isCustom: true }];
      return {
        fitment: {
          ...state.fitment,
          speakers: nextSpeakers,
        },
      };
    }),
  setWiringEstimate: (estimate, options) =>
    set((state) => {
      const source = options?.source ?? 'auto';
      if (!estimate) {
        return {
          wiringEstimate: undefined,
          wiringEstimateAuto: source === 'auto' ? undefined : state.wiringEstimateAuto,
          wiringEstimateSource: 'auto',
        };
      }
      return {
        wiringEstimate: estimate,
        wiringEstimateAuto: source === 'auto' ? estimate : state.wiringEstimateAuto,
        wiringEstimateSource: source,
      };
    }),
  restoreAutoWiringEstimate: () =>
    set((state) => {
      if (!state.wiringEstimateAuto) {
        return state;
      }
      return {
        wiringEstimate: state.wiringEstimateAuto,
        wiringEstimateSource: 'auto',
      };
    }),
  addComponent: (component) =>
    set((state) => {
      const nextComponents = [...state.selectedComponents, component];
      return {
        selectedComponents: nextComponents,
        budget: {
          ...state.budget,
          ...calculateBudgetTotals(nextComponents),
        },
      };
    }),
  removeComponent: (componentId) =>
    set((state) => {
      const updatedComponents = state.selectedComponents.filter((comp) => comp.id !== componentId);
      return {
        selectedComponents: updatedComponents,
        budget: {
          ...state.budget,
          ...calculateBudgetTotals(updatedComponents),
        },
      };
    }),
  setComponents: (components) =>
    set((state) => ({
      selectedComponents: components,
      budget: {
        ...state.budget,
        ...calculateBudgetTotals(components),
      },
    })),
  setSafetyChecks: (issues) => set({ safetyChecks: issues }),
  updateBudget: (budget) => set((state) => ({ budget: { ...state.budget, ...budget } })),
}));
