import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from 'reactflow';
import './App.css';
import WiringDiagram from './components/WiringDiagram';
import ComponentBrowser from './components/ComponentBrowser';
import ProjectSummary from './components/ProjectSummary';
import WireGaugeCalculator from './components/WireGaugeCalculator';
import CustomNode from './components/CustomNode';
import { BudgetPlanner, TutorialsPanel, SafetyChecklistPanel } from './components/SidebarPanels';
import VehicleFitmentPanel from './components/VehicleFitmentPanel';
import VehicleSetupControls from './components/VehicleSetupControls';
import { useAppStore } from './state/useAppStore';
import ThemeToggle from './components/ThemeToggle';
import vehicleSpecsData from './data/vehicle_specs.json';
import corporationMapData from './data/corporationMap.json';
import { fetchAllMakes, fetchModelsForMake } from './services/nhtsa';
import type { AudioComponent, VehicleCorporation, VehicleSpecs } from './types';

const baseNodes: Node[] = [
  {
    id: 'battery',
    type: 'custom',
    data: {
      label: 'Battery +12V',
      subtitle: 'Engine bay, primary source',
      hint: 'Use 4 AWG OFC cable and a weatherproof grommet when routing into the cabin.',
    },
    position: { x: -320, y: 0 },
  },
  {
    id: 'main-fuse',
    type: 'custom',
    data: {
      label: 'Main ANL Fuse Holder',
      subtitle: '150A within 18" of battery',
      hint: 'Mount solidly and crimp lugs with adhesive heat-shrink for corrosion protection.',
    },
    position: { x: -60, y: 20 },
  },
  {
    id: 'distribution',
    type: 'custom',
    data: {
      label: 'Power Distribution Block',
      subtitle: 'Cabin mounting plate',
      hint: 'Split primary feed into equal-length leads for each amplifier.',
    },
    position: { x: 220, y: 120 },
  },
  {
    id: 'primary-amp',
    type: 'custom',
    data: {
      label: 'Primary Amplifier',
      subtitle: 'Secured to amp rack',
      hint: 'Connect power/ground with 4 AWG, torque terminals, and keep airflow clear.',
    },
    position: { x: 220, y: 300 },
  },
  {
    id: 'head-unit',
    type: 'custom',
    data: {
      label: 'Head Unit / DSP',
      subtitle: 'Factory dash or aftermarket chassis',
      hint: 'Feed RCA / Toslink to amplifiers and provide ACC remote output.',
    },
    position: { x: -320, y: 260 },
  },
  {
    id: 'remote-lead',
    type: 'custom',
    data: {
      label: 'Remote Turn-On Lead',
      subtitle: '18 AWG blue wire',
      hint: 'Route alongside signal cables; relay if multiple amplifiers are triggered.',
    },
    position: { x: -40, y: 280 },
  },
  {
    id: 'ground-point',
    type: 'custom',
    data: {
      label: 'Chassis Ground',
      subtitle: 'Bare metal within 18" of amp',
      hint: 'Sand paint, use star washer, and torque bolt to spec.',
    },
    position: { x: 220, y: 460 },
  },
];

const baseEdges: Edge[] = [
  {
    id: 'battery-main-fuse',
    source: 'battery',
    target: 'main-fuse',
    label: '4 AWG OFC power feed',
    labelStyle: { fill: '#f97316', fontWeight: 600 },
    style: { stroke: '#f97316', strokeWidth: 2 },
  },
  {
    id: 'main-fuse-distribution',
    source: 'main-fuse',
    target: 'distribution',
    label: 'Run through firewall with grommet',
    labelStyle: { fill: '#f97316', fontWeight: 600 },
    style: { stroke: '#f97316', strokeWidth: 2 },
  },
  {
    id: 'distribution-amp',
    source: 'distribution',
    target: 'primary-amp',
    label: '4 AWG to amplifier',
    labelStyle: { fill: '#ef4444', fontWeight: 600 },
    style: { stroke: '#ef4444', strokeWidth: 2 },
  },
  {
    id: 'headunit-remote',
    source: 'head-unit',
    target: 'remote-lead',
    label: 'Remote turn-on (ACC)',
    style: { stroke: '#6366f1', strokeDasharray: '6 3', strokeWidth: 1.5 },
    labelStyle: { fill: '#6366f1', fontWeight: 600 },
  },
  {
    id: 'remote-amp',
    source: 'remote-lead',
    target: 'primary-amp',
    label: '18 AWG remote lead',
    style: { stroke: '#6366f1', strokeDasharray: '6 3', strokeWidth: 1.5 },
    labelStyle: { fill: '#6366f1', fontWeight: 600 },
  },
  {
    id: 'amp-ground',
    source: 'primary-amp',
    target: 'ground-point',
    label: '4 AWG chassis ground',
    labelStyle: { fill: '#1f2937', fontWeight: 600 },
    style: { stroke: '#1f2937', strokeWidth: 2 },
  },
  {
    id: 'headunit-amp-signal',
    source: 'head-unit',
    target: 'primary-amp',
    label: 'RCA / Fiber signal bundle',
    style: { stroke: '#0ea5e9', strokeDasharray: '4 4', strokeWidth: 1.5 },
    labelStyle: { fill: '#0ea5e9', fontWeight: 600 },
  },
];

const createInitialNodes = () =>
  baseNodes.map(node => ({
    ...node,
    data: { ...(typeof node.data === 'object' ? node.data : {}) },
  }));

const createInitialEdges = () =>
  baseEdges.map(edge => ({ ...edge }));

const getComponentNodeDetails = (component: AudioComponent) => {
  const subtitleParts: string[] = [];
  if (component.category) subtitleParts.push(component.category);
  if (component.specs?.size) subtitleParts.push(`${component.specs.size}"`);
  if (component.specs?.channels && !subtitleParts.some(part => part.includes('ch'))) {
    subtitleParts.push(`${component.specs.channels}ch`);
  }

  const type = component.type?.toLowerCase() ?? '';
  let hint: string | undefined;

  if (type.includes('amplifier')) {
    hint = 'Secure amp, ensure airflow, and torque power/ground lugs after crimping.';
  } else if (type.includes('subwoofer')) {
    hint = 'Confirm enclosure volume, use 12 AWG wire, and seal terminals against moisture.';
  } else if (type.includes('speaker')) {
    hint = 'Use adapter brackets or foam gaskets to avoid air leaks and rattles.';
  } else if (type.includes('head-unit')) {
    hint = 'Retain factory controls, secure the harness, and level-match outputs to the DSP/amp.';
  } else if (type.includes('dsp')) {
    hint = 'Mount near amp rack, keep signal cables short, and document base tune files.';
  } else if (type.includes('wiring')) {
    hint = 'Route away from heat and moving parts, protect with loom, and anchor every 12 inches.';
  } else if (type.includes('accessory')) {
    hint = 'Mount within reach, use adhesive pads or screws, and dress the cable routing neatly.';
  }

  return {
    subtitle: subtitleParts.join(' • ') || undefined,
    hint,
  };
};

const nodeTypes = {
  custom: CustomNode,
};

const LOCATION_BASELINE_FEET: Record<string, number> = {
  front_door: 28,
  rear_door: 36,
  rear_deck: 40,
  dash: 16,
  front_dash: 16,
  rear_pillar: 32,
  tweeter: 18,
  kick_panel: 22,
};

const feetFromMeters = (value: number) => Math.round(value * 3.281);

const estimatePowerRun = (cabinLengthFeet?: number) => {
  if (!cabinLengthFeet || Number.isNaN(cabinLengthFeet)) {
    return 16;
  }
  return Math.max(12, Math.round(cabinLengthFeet + 4));
};

const estimateSpeakerWire = (speakers: { location: string }[], cabinLengthFeet?: number) => {
  if (!speakers || speakers.length === 0) {
    return cabinLengthFeet ? Math.round(cabinLengthFeet * 2.2) : 40;
  }

  const adjustment = cabinLengthFeet ? Math.max(0.9, Math.min(1.4, cabinLengthFeet / 15)) : 1;

  const total = speakers.reduce((sum, spec) => {
    const key = spec.location.replace(/\s+/g, '_').toLowerCase();
    const baseline = LOCATION_BASELINE_FEET[key] ?? 24;
    return sum + baseline;
  }, 0);

  return Math.round(total * adjustment);
};

const CORPORATION_MAP = corporationMapData as Record<string, string>;

const formatMakeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/(^|[\s-\/])([a-z])/g, (_, boundary, letter) => `${boundary}${letter.toUpperCase()}`);

const corporationFallbackList = buildCorporationList(CORPORATION_MAP);

function buildCorporationList(mapping: Record<string, string>): VehicleCorporation[] {
  const grouped = new Map<string, Set<string>>();

  Object.entries(mapping).forEach(([make, corporation]) => {
    if (!corporation) return;
    const key = corporation.trim();
    if (!grouped.has(key)) {
      grouped.set(key, new Set());
    }
    grouped.get(key)!.add(formatMakeName(make));
  });

  return Array.from(grouped.entries())
    .map(([corporation, makes]) => ({
      corporation,
      makes: Array.from(makes).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.corporation.localeCompare(b.corporation));
}

function App() {
  const view = useAppStore(state => state.view);
  const setView = useAppStore(state => state.setView);
  const setCorporations = useAppStore(state => state.setCorporations);
  const setMakes = useAppStore(state => state.setMakes);
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const setVehicleSelection = useAppStore(state => state.setVehicleSelection);
  const setModelOptions = useAppStore(state => state.setModelOptions);
  const fitment = useAppStore(state => state.fitment);
  const setFitment = useAppStore(state => state.setFitment);
  const setWiringEstimate = useAppStore(state => state.setWiringEstimate);
  const wiringEstimate = useAppStore(state => state.wiringEstimate);
  const selectedComponents = useAppStore(state => state.selectedComponents);
  const removeComponent = useAppStore(state => state.removeComponent);
  const upsertTutorials = useAppStore(state => state.upsertTutorials);
  const setSafetyChecks = useAppStore(state => state.setSafetyChecks);
  const theme = useAppStore(state => state.theme);
  const budget = useAppStore(state => state.budget);

  const [vehicleLoading, setVehicleLoading] = useState<boolean>(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());
  const nodeCounter = useRef(baseNodes.length + 1);

  const totalRms = useMemo(
    () => selectedComponents.reduce((total, comp) => total + (comp.specs?.rms_wattage || 0), 0),
    [selectedComponents],
  );
  const totalPeak = useMemo(
    () => selectedComponents.reduce((total, comp) => total + (comp.specs?.peak_wattage || 0), 0),
    [selectedComponents],
  );

  const vehicleDescriptor = useMemo(() => {
    if (!vehicleSelection.make) return null;
    const parts = [vehicleSelection.make];
    if (vehicleSelection.model) parts.push(vehicleSelection.model);
    if (vehicleSelection.year) parts.push(`(${vehicleSelection.year})`);
    return parts.join(' ');
  }, [vehicleSelection.make, vehicleSelection.model, vehicleSelection.year]);

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setVehicleLoading(true);
      setVehicleError(null);

      try {
        const makesFromApi = await fetchAllMakes();
        if (cancelled) return;

        setMakes(makesFromApi);
        const makesFromApiSet = new Set(makesFromApi.map(make => make.toUpperCase()));
        const grouped = new Map<string, Set<string>>();

        Object.entries(CORPORATION_MAP).forEach(([make, corporation]) => {
          if (!corporation) return;
          if (!makesFromApiSet.has(make.toUpperCase())) return;
          if (!grouped.has(corporation)) {
            grouped.set(corporation, new Set());
          }
          grouped.get(corporation)!.add(formatMakeName(make));
        });

        const corporationList: VehicleCorporation[] = grouped.size > 0
          ? Array.from(grouped.entries())
              .map(([corpName, makes]) => ({
                corporation: corpName,
                makes: Array.from(makes).sort((a, b) => a.localeCompare(b)),
              }))
              .sort((a, b) => a.corporation.localeCompare(b.corporation))
          : corporationFallbackList;

        setCorporations(corporationList);
        if (grouped.size === 0) {
          setVehicleError('Showing curated brand list while NHTSA data is limited.');
        }

        if (corporationList.length > 0 && !vehicleSelection.corporation) {
          const firstCorp = corporationList[0];
          setVehicleSelection({
            corporation: firstCorp.corporation,
            make: firstCorp.makes[0] ?? undefined,
            model: undefined,
            year: undefined,
            trim: undefined,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load vehicle list', error);
          setCorporations(corporationFallbackList);
          setVehicleError('Unable to reach NHTSA. Showing core brands.');
        }
      } finally {
        if (!cancelled) {
          setVehicleLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [setCorporations, setMakes, setVehicleSelection, vehicleSelection.corporation]);

  const loadModelOptions = useCallback(async () => {
    if (!vehicleSelection.make) {
      setModelOptions([]);
      return;
    }

    setModelLoading(true);
    setModelError(null);

    try {
      const models = await fetchModelsForMake(vehicleSelection.make);
      setModelOptions(models);

      if (models.length === 0) {
        setVehicleSelection({ model: undefined, year: undefined, trim: undefined });
        return;
      }

      const currentModelEntry = vehicleSelection.model
        ? models.find(item => item.model.toLowerCase() === (vehicleSelection.model ?? '').toLowerCase())
        : undefined;

      const targetModel = currentModelEntry ?? models[0];
      const nextSelection: Partial<typeof vehicleSelection> = {};

      if (!currentModelEntry) {
        nextSelection.model = targetModel.model;
      }

      if (targetModel.years && targetModel.years.length > 0) {
        const numericYear = vehicleSelection.year ? Number(vehicleSelection.year) : undefined;
        if (!numericYear || !targetModel.years.includes(numericYear)) {
          const latestYear = targetModel.years[targetModel.years.length - 1];
          nextSelection.year = String(latestYear);
        }
      } else {
        nextSelection.year = undefined;
      }

      nextSelection.trim = undefined;

      if (Object.keys(nextSelection).length > 0) {
        setVehicleSelection(nextSelection);
      }
    } catch (error) {
      console.error('Unable to load models for make', error);
      setModelOptions([]);
      setModelError('Unable to load model list right now.');
    } finally {
      setModelLoading(false);
    }
  }, [setModelOptions, setVehicleSelection, vehicleSelection.make, vehicleSelection.model, vehicleSelection.year]);

  useEffect(() => {
    void loadModelOptions();
  }, [loadModelOptions]);

  useEffect(() => {
    upsertTutorials([
      {
        id: 'planning-basics',
        title: 'Planning Your First Car Audio Upgrade',
        description: 'Understand the components, wiring paths, and safety essentials before turning a wrench.',
        url: 'https://www.crutchfield.com/learn/car-audio-video-installation-guide.html',
        tags: ['planning', 'beginner'],
      },
      {
        id: 'amp-wiring',
        title: 'How to Wire an Amplifier Safely',
        description: 'Step-by-step walkthrough covering power routing, grounding, and fuse placement.',
        url: 'https://www.sonicelectronix.com/learn/how-to-install-a-car-amplifier/',
        tags: ['wiring', 'safety'],
      },
      {
        id: 'tuning-basics',
        title: 'Tuning for Clear Sound',
        description: 'Learn gain structure, crossover points, and DSP basics for a balanced system.',
        tags: ['tuning'],
      },
    ]);
  }, [upsertTutorials]);

  useEffect(() => {
    const safetyIssues = [];
    const estimatedCurrentDraw = totalRms > 0 ? Math.round(totalRms / 12) : 0;
    const hasAmplifier = selectedComponents.some(comp => comp.type.toLowerCase().includes('amplifier'));
    const hasSubwoofer = selectedComponents.some(comp => comp.type.toLowerCase().includes('subwoofer'));
    const hasWiringKit = selectedComponents.some(comp => comp.type.toLowerCase().includes('wiring'));
    const totalBudgetSpend = budget.componentTotal + budget.wiringTotal + budget.accessoriesTotal;

    if (totalRms > 2000) {
      safetyIssues.push({
        id: 'high-rms',
        message: 'Total RMS exceeds 2000W. Confirm your power wiring and alternator can support this load.',
        severity: 'warning' as const,
      });
    }
    if (estimatedCurrentDraw > 150) {
      safetyIssues.push({
        id: 'fuse-capacity',
        message: `Estimated current draw is about ${estimatedCurrentDraw}A. Upgrade main fuse and power wire sizing beyond the default 150A/4 AWG plan.`,
        severity: 'warning' as const,
      });
    }
    if (hasAmplifier && wiringEstimate?.powerRunFeet && wiringEstimate.powerRunFeet > 20) {
      safetyIssues.push({
        id: 'long-power-run',
        message: `Power run is roughly ${wiringEstimate.powerRunFeet}ft. Verify voltage drop and consider thicker gauge or auxiliary battery.`,
        severity: 'info' as const,
      });
    }
    if (selectedComponents.some(comp => comp.category.toLowerCase().includes('amplifier')) && !fitment) {
      safetyIssues.push({
        id: 'fitment-unknown',
        message: 'Amplifier added without vehicle fitment data. Verify mounting space and airflow.',
        severity: 'info' as const,
      });
    }
    if (selectedComponents.length > 0 && totalPeak === 0) {
      safetyIssues.push({
        id: 'missing-power-data',
        message: 'Some components are missing RMS/peak wattage details. Add specs to validate wiring.',
        severity: 'info' as const,
      });
    }
    if (hasSubwoofer && !hasAmplifier) {
      safetyIssues.push({
        id: 'no-amp-for-sub',
        message: 'Subwoofers added without a dedicated amplifier. Add an amp or powered enclosure to drive them safely.',
        severity: 'warning' as const,
      });
    }
    if (hasAmplifier && !hasWiringKit) {
      safetyIssues.push({
        id: 'missing-wiring-kit',
        message: 'Add a wiring kit or power/ground accessories to complete the amplifier installation.',
        severity: 'info' as const,
      });
    }
    if (typeof budget.target === 'number' && budget.target > 0 && totalBudgetSpend > budget.target) {
      safetyIssues.push({
        id: 'over-budget',
        message: `Current build total of $${totalBudgetSpend.toFixed(2)} exceeds the budget target by $${(totalBudgetSpend - budget.target).toFixed(2)}.`,
        severity: 'warning' as const,
      });
    }
    setSafetyChecks(safetyIssues);
  }, [budget.accessoriesTotal, budget.componentTotal, budget.target, budget.wiringTotal, fitment, selectedComponents, totalPeak, totalRms, setSafetyChecks, wiringEstimate]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge(params, eds));
  }, [setEdges]);

  const handleRemoveComponent = useCallback(({ nodeId, componentId }: { nodeId: string; componentId?: string }) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (componentId) {
      removeComponent(componentId);
    }
  }, [removeComponent, setEdges, setNodes]);

  const handleAddComponentNode = useCallback((component: AudioComponent) => {
    const newNodeId = `node-${nodeCounter.current++}`;
    const position = {
      x: 160 + (Math.random() * 240 - 120),
      y: 340 + Math.random() * 180,
    };
    const { subtitle, hint } = getComponentNodeDetails(component);
    const label = component.brand ? `${component.brand} ${component.name}` : component.name;
    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position,
      data: {
        label,
        subtitle,
        hint,
        onRemove: handleRemoveComponent,
        nodeId: newNodeId,
        componentId: component.id,
      },
    };
    setNodes(nds => nds.concat(newNode));
  }, [handleRemoveComponent, setNodes]);

  const fetchVehicleSpecs = useCallback((make?: string, model?: string) => {
    if (!make || !model) {
      return;
    }

    const specsMap = vehicleSpecsData as Record<string, Record<string, VehicleSpecs>>;
    const makeKey = Object.keys(specsMap).find(key => key.toLowerCase() === make.toLowerCase());
    if (!makeKey) {
      setFitment(undefined);
      setWiringEstimate({ powerRunFeet: 16, speakerRunFeet: 40, remoteTurnOnFeet: 14 }, { source: 'auto' });
      return;
    }

    const modelRecord = specsMap[makeKey];
    const modelKey = Object.keys(modelRecord).find(key => key.toLowerCase() === model.toLowerCase());
    if (!modelKey) {
      setFitment(undefined);
      setWiringEstimate({ powerRunFeet: 16, speakerRunFeet: 40, remoteTurnOnFeet: 14 }, { source: 'auto' });
      return;
    }

    const specs = modelRecord[modelKey];
    const speakers = Object.entries(specs.speakers || {}).map(([location, size]) => ({
      location,
      size,
    }));
    setFitment({ speakers, wiringRunNotes: 'Use factory routing where possible and protect wires with loom.' });

    const cabinLengthFeet = specs.cabinDimensions?.frontToRearLength
      ? feetFromMeters(specs.cabinDimensions.frontToRearLength)
      : undefined;
    const powerRunFeet = estimatePowerRun(cabinLengthFeet);
    const speakerRunFeet = estimateSpeakerWire(speakers, cabinLengthFeet);
    const remoteTurnOnFeet = Math.max(10, Math.round(powerRunFeet * 0.9));

    setWiringEstimate({ powerRunFeet, speakerRunFeet, remoteTurnOnFeet }, { source: 'auto' });
  }, [setFitment, setWiringEstimate]);

  useEffect(() => {
    if (!vehicleSelection.make || !vehicleSelection.model) return;
    fetchVehicleSpecs(vehicleSelection.make, vehicleSelection.model);
  }, [fetchVehicleSpecs, vehicleSelection.make, vehicleSelection.model]);

  const renderHome = () => (
    <div className="home-view">
      <h2>Design Your Perfect Car Audio System</h2>
      <p>
        Pick your vehicle, explore components that fit, and build a wiring plan with confidence. Tutorials and safety checks guide you every step of the way.
      </p>
      <div className="home-actions">
        <button onClick={() => setView('project')} className="start-button">Start a New Build</button>
        <button onClick={() => setView('learn')} className="secondary-button">Browse Tutorials</button>
      </div>
    </div>
  );

  const renderProject = () => (
    <div>
      <div className="project-view">
        <div className="main-content">
          {vehicleLoading && <p className="vehicle-info">Loading brand list…</p>}
          {vehicleError && !vehicleLoading && <p className="vehicle-info">{vehicleError}</p>}
          <section className="vehicle-setup-section">
            <VehicleSetupControls loading={modelLoading} error={modelError} onRetry={loadModelOptions} />
          </section>
          <section className="diagram-section">
            <div className="section-header">
              <h2>Wiring Diagram</h2>
              {vehicleDescriptor && <span className="vehicle-tag">{vehicleDescriptor}</span>}
            </div>
            <WiringDiagram
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
            />
          </section>
          <section className="component-section">
            <ComponentBrowser onComponentAdd={handleAddComponentNode} />
          </section>
        </div>
        <aside className="sidebar">
          <VehicleFitmentPanel />
          <ProjectSummary />
          <BudgetPlanner />
          <WireGaugeCalculator />
          <SafetyChecklistPanel />
          <TutorialsPanel />
        </aside>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="learn-view">
      <h2>Learn the Essentials</h2>
      <p>Prep for your install with curated guides on planning, wiring, tuning, and safety.</p>
      <TutorialsPanel />
      <button onClick={() => setView('project')} className="start-button">Start Building</button>
    </div>
  );

  let content: ReactNode = null;
  switch (view) {
    case 'home':
      content = renderHome();
      break;
    case 'project':
      content = renderProject();
      break;
    case 'learn':
      content = renderLearn();
      break;
    default:
      content = null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-primary">
          <h1>Car Audio Builder</h1>
          {vehicleDescriptor && view === 'project' && (
            <p>System planning for <strong>{vehicleDescriptor}</strong></p>
          )}
        </div>
        <nav className="app-nav">
          <button
            className={view === 'home' ? 'active' : ''}
            onClick={() => setView('home')}
          >
            Home
          </button>
          <button
            className={view === 'project' ? 'active' : ''}
            onClick={() => setView('project')}
          >
            Project
          </button>
          <button
            className={view === 'learn' ? 'active' : ''}
            onClick={() => setView('learn')}
          >
            Tutorials
          </button>
          <ThemeToggle />
        </nav>
      </header>
      <main>
        {content}
      </main>
    </div>
  );
}

export default App;
