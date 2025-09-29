import { create } from 'zustand';
import type { AudioComponent, VehicleCorporation } from '../types';

type AppView = 'home' | 'vehicle-selection' | 'project' | 'learn';

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

interface TutorialEntry {
  id: string;
  title: string;
  description: string;
  url?: string;
  tags: string[];
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
  fitment?: FitmentInfo;
  wiringEstimate?: WiringRunEstimate;
  selectedComponents: AudioComponent[];
  tutorials: TutorialEntry[];
  safetyChecks: SafetyCheckIssue[];
  budget: BudgetState;
  setView: (view: AppView) => void;
  setCorporations: (data: VehicleCorporation[]) => void;
  setVehicleSelection: (selection: Partial<VehicleSelection>) => void;
  resetVehicleSelection: () => void;
  setFitment: (fitment?: FitmentInfo) => void;
  setWiringEstimate: (estimate?: WiringRunEstimate) => void;
  addComponent: (component: AudioComponent) => void;
  removeComponent: (id: string) => void;
  setComponents: (components: AudioComponent[]) => void;
  upsertTutorials: (entries: TutorialEntry[]) => void;
  setSafetyChecks: (issues: SafetyCheckIssue[]) => void;
  updateBudget: (budget: Partial<BudgetState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  vehicleSelection: {},
  corporations: [],
  fitment: undefined,
  wiringEstimate: undefined,
  selectedComponents: [],
  tutorials: [],
  safetyChecks: [],
  budget: {
    target: undefined,
    componentTotal: 0,
    wiringTotal: 0,
    accessoriesTotal: 0,
  },
  setView: (view) => set({ view }),
  setCorporations: (data) => set({ corporations: data }),
  setVehicleSelection: (selection) =>
    set((state) => ({ vehicleSelection: { ...state.vehicleSelection, ...selection } })),
  resetVehicleSelection: () =>
    set({
      vehicleSelection: {},
      fitment: undefined,
      wiringEstimate: undefined,
      selectedComponents: [],
      safetyChecks: [],
    }),
  setFitment: (fitment) => set({ fitment }),
  setWiringEstimate: (estimate) => set({ wiringEstimate: estimate }),
  addComponent: (component) =>
    set((state) => ({
      selectedComponents: [...state.selectedComponents, component],
      budget: {
        ...state.budget,
        componentTotal: [...state.selectedComponents, component].reduce((sum, comp) => sum + comp.price, 0),
      },
    })),
  removeComponent: (componentId) =>
    set((state) => {
      const updatedComponents = state.selectedComponents.filter((comp) => comp.id !== componentId);
      return {
        selectedComponents: updatedComponents,
        budget: {
          ...state.budget,
          componentTotal: updatedComponents.reduce((sum, comp) => sum + comp.price, 0),
        },
      };
    }),
  setComponents: (components) =>
    set((state) => ({
      selectedComponents: components,
      budget: {
        ...state.budget,
        componentTotal: components.reduce((sum, comp) => sum + comp.price, 0),
      },
    })),
  upsertTutorials: (entries) => set({ tutorials: entries }),
  setSafetyChecks: (issues) => set({ safetyChecks: issues }),
  updateBudget: (budget) => set((state) => ({ budget: { ...state.budget, ...budget } })),
}));
