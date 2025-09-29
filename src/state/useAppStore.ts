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
      budget: {
        target: undefined,
        componentTotal: 0,
        wiringTotal: 0,
        accessoriesTotal: 0,
      },
    }),
  setFitment: (fitment) => set({ fitment }),
  setWiringEstimate: (estimate) => set({ wiringEstimate: estimate }),
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
  upsertTutorials: (entries) => set({ tutorials: entries }),
  setSafetyChecks: (issues) => set({ safetyChecks: issues }),
  updateBudget: (budget) => set((state) => ({ budget: { ...state.budget, ...budget } })),
}));

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
