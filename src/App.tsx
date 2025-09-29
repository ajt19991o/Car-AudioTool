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
import vehicleSpecsData from './data/vehicle_specs.json';
import corporationMapData from './data/corporationMap.json';
import type { AudioComponent, VehicleCorporation, VehicleSpecs } from './types';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Battery (+12V)' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Head Unit' }, position: { x: 250, y: 150 } },
  { id: '3', type: 'output', data: { label: 'Chassis Ground (-)' }, position: { x: 250, y: 300 } },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'Constant 12V Feed',
    labelStyle: { fill: '#f00', fontWeight: 700 },
    style: { stroke: '#f00' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'Ground Return',
    labelStyle: { fill: '#000', fontWeight: 700 },
    style: { stroke: '#000' },
  },
];

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

const formatMakeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/(^|[\s-\/])([a-z])/g, (_, boundary, letter) => `${boundary}${letter.toUpperCase()}`);

function App() {
  const view = useAppStore(state => state.view);
  const setView = useAppStore(state => state.setView);
  const corporations = useAppStore(state => state.corporations);
  const setCorporations = useAppStore(state => state.setCorporations);
  const vehicleSelection = useAppStore(state => state.vehicleSelection);
  const setVehicleSelection = useAppStore(state => state.setVehicleSelection);
  const resetVehicleSelection = useAppStore(state => state.resetVehicleSelection);
  const setModelOptions = useAppStore(state => state.setModelOptions);
  const fitment = useAppStore(state => state.fitment);
  const setFitment = useAppStore(state => state.setFitment);
  const setWiringEstimate = useAppStore(state => state.setWiringEstimate);
  const selectedComponents = useAppStore(state => state.selectedComponents);
  const removeComponent = useAppStore(state => state.removeComponent);
  const upsertTutorials = useAppStore(state => state.upsertTutorials);
  const setSafetyChecks = useAppStore(state => state.setSafetyChecks);

  const [selectedCorp, setSelectedCorp] = useState<VehicleCorporation | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState<boolean>(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeCounter = useRef(initialNodes.length + 1);

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
    const allowedMakes = new Set(Object.keys(CORPORATION_MAP).map(name => name.toUpperCase()));
    let cancelled = false;

    const controller = new AbortController();

    const load = async () => {
      setVehicleLoading(true);
      try {
        const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`NHTSA responded with ${response.status}`);
        }

        const data: { Results?: Array<{ Make_Name?: string }> } = await response.json();
        if (cancelled) return;

        const grouped = new Map<string, Set<string>>();

        (data.Results ?? []).forEach((item) => {
          const makeNameRaw = item.Make_Name?.trim();
          if (!makeNameRaw) return;
          const makeNameUpper = makeNameRaw.toUpperCase();
          if (!allowedMakes.has(makeNameUpper)) return;

          const corporation = CORPORATION_MAP[makeNameUpper];
          if (!corporation) return;
          if (!grouped.has(corporation)) {
            grouped.set(corporation, new Set());
          }
          grouped.get(corporation)!.add(formatMakeName(makeNameRaw));
        });

        const corporationList: VehicleCorporation[] = grouped.size > 0
          ? Array.from(grouped.entries())
              .map(([corporation, makes]) => ({
                corporation,
                makes: Array.from(makes).sort((a, b) => a.localeCompare(b)),
              }))
              .sort((a, b) => a.corporation.localeCompare(b.corporation))
          : corporationFallbackList;

        setCorporations(corporationList);
        setVehicleError(grouped.size > 0 ? null : 'Showing curated brand list while NHTSA data is limited.');
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load vehicle list', error);
        setCorporations(corporationFallbackList);
        setVehicleError('Unable to reach NHTSA. Showing core brands.');
      } finally {
        if (!cancelled) setVehicleLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [setCorporations]);

  const loadModelOptions = useCallback(() => {
    if (!vehicleSelection.make) {
      setModelOptions([]);
      return;
    }

    const specsMap = vehicleSpecsData as Record<string, Record<string, VehicleSpecs>>;
    const makeKey = Object.keys(specsMap).find(key => key.toLowerCase() === vehicleSelection.make?.toLowerCase());

    if (!makeKey) {
      setModelOptions([]);
      return;
    }

    const modelsRecord = specsMap[makeKey];
    const models = Object.entries(modelsRecord).map(([modelName, details]) => ({
      model: modelName,
      years: details.years ?? [],
      trims: details.trims ?? [],
    }));

    setModelOptions(models);

    if (models.length === 0) {
      return;
    }

    const currentModelEntry = models.find(item => item.model.toLowerCase() === (vehicleSelection.model ?? '').toLowerCase());
    let nextSelection: Partial<typeof vehicleSelection> = {};

    if (!currentModelEntry) {
      const fallback = models[0];
      nextSelection = {
        model: fallback.model,
        year: fallback.years && fallback.years.length > 0 ? String(fallback.years[0]) : undefined,
        trim: fallback.trims && fallback.trims.length > 0 ? fallback.trims[0] : undefined,
      };
    } else {
      if (currentModelEntry.years && currentModelEntry.years.length > 0) {
        const numericYear = vehicleSelection.year ? Number(vehicleSelection.year) : undefined;
        if (!numericYear || !currentModelEntry.years.includes(numericYear)) {
          nextSelection.year = String(currentModelEntry.years[0]);
        }
      }
      if (currentModelEntry.trims && currentModelEntry.trims.length > 0) {
        if (!vehicleSelection.trim || !currentModelEntry.trims.includes(vehicleSelection.trim)) {
          nextSelection.trim = currentModelEntry.trims[0];
        }
      }
    }

    if (Object.keys(nextSelection).length > 0) {
      setVehicleSelection(nextSelection);
    }
  }, [setModelOptions, setVehicleSelection, vehicleSelection.make, vehicleSelection.model, vehicleSelection.year, vehicleSelection.trim]);

  useEffect(() => {
    loadModelOptions();
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
    if (totalRms > 2000) {
      safetyIssues.push({
        id: 'high-rms',
        message: 'Total RMS exceeds 2000W. Confirm your power wiring and alternator can support this load.',
        severity: 'warning' as const,
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
    setSafetyChecks(safetyIssues);
  }, [fitment, selectedComponents, totalPeak, totalRms, setSafetyChecks]);

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
      x: 100 + Math.random() * 300,
      y: 200 + Math.random() * 200,
    };
    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position,
      data: {
        label: component.name,
        onRemove: handleRemoveComponent,
        nodeId: newNodeId,
        componentId: component.id,
      },
    };
    setNodes(nds => nds.concat(newNode));
  }, [handleRemoveComponent, setNodes]);

  const handleSelectMake = useCallback((corp: VehicleCorporation, make: string) => {
    setVehicleSelection({ corporation: corp.corporation, make, model: undefined, year: undefined, trim: undefined });
    setModelOptions([]);
    setSelectedCorp(corp);
    setView('project');
  }, [setModelOptions, setVehicleSelection, setView]);

  const handleBackToVehicleList = useCallback(() => {
    resetVehicleSelection();
    setSelectedCorp(null);
    setView('vehicle-selection');
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [resetVehicleSelection, setEdges, setNodes, setView]);

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
        <button onClick={() => setView('vehicle-selection')} className="start-button">Start a New Build</button>
        <button onClick={() => setView('learn')} className="secondary-button">Browse Tutorials</button>
      </div>
    </div>
  );

  const renderVehicleSelection = () => {
    if (vehicleLoading) {
      return <p>Loading vehicle list...</p>;
    }

    return selectedCorp ? (
      <div className="make-list">
        <button onClick={() => setSelectedCorp(null)} className="back-button">← Back to Brands</button>
        <h3>{selectedCorp.corporation}</h3>
        <ul>
          {selectedCorp.makes.map(make => (
            <li key={make} onClick={() => handleSelectMake(selectedCorp, make)}>
              {make}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <>
        {vehicleError && <p className="vehicle-info">{vehicleError}</p>}
        <div className="vehicle-grid">
          {corporations.map(corp => (
            <div key={corp.corporation} className="corp-card" onClick={() => setSelectedCorp(corp)}>
              <span>{corp.corporation}</span>
              <small>{corp.makes.slice(0, 4).join(', ')}{corp.makes.length > 4 ? '…' : ''}</small>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderProject = () => (
    <div>
      <button onClick={handleBackToVehicleList} className="back-button">← Change Vehicle</button>
      <div className="project-view">
        <div className="main-content">
          <section className="vehicle-setup-section">
            <VehicleSetupControls loading={false} error={null} onRetry={loadModelOptions} />
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
      <button onClick={() => setView('vehicle-selection')} className="start-button">Start Building</button>
    </div>
  );

  let content: ReactNode = null;
  switch (view) {
    case 'home':
      content = renderHome();
      break;
    case 'vehicle-selection':
      content = renderVehicleSelection();
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
            className={view === 'vehicle-selection' ? 'active' : ''}
            onClick={() => setView('vehicle-selection')}
          >
            Vehicles
          </button>
          <button
            className={view === 'project' ? 'active' : ''}
            onClick={() => setView('project')}
            disabled={!vehicleSelection.make}
          >
            Project
          </button>
          <button
            className={view === 'learn' ? 'active' : ''}
            onClick={() => setView('learn')}
          >
            Tutorials
          </button>
        </nav>
      </header>
      <main>
        {content}
      </main>
    </div>
  );
}

export default App;
