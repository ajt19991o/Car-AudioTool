import { useState, useEffect } from 'react';
import { type Node, type Edge, useNodesState, useEdgesState, addEdge, type Connection } from 'reactflow';
import './App.css';
import WiringDiagram from './components/WiringDiagram';
import ComponentBrowser from './components/ComponentBrowser';
import ProjectSummary from './components/ProjectSummary';
import WireGaugeCalculator from './components/WireGaugeCalculator';
import CustomNode from './components/CustomNode';
import { type VehicleCorporation, type AudioComponent } from './types';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Car Battery' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Head Unit' }, position: { x: 250, y: 150 } },
  { id: '3', type: 'output', data: { label: 'Chassis Ground' }, position: { x: 250, y: 300 } },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: '12V Constant (+12V)',
    labelStyle: { fill: '#f00', fontWeight: 700 },
    style: { stroke: '#f00' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'Ground (-)',
    labelStyle: { fill: '#000', fontWeight: 700 },
    style: { stroke: '#000' },
  },
];

const nodeTypes = {
  custom: CustomNode,
};

let nodeId = 4; // Start after initial nodes

function App() {
  const [vehicleData, setVehicleData] = useState<VehicleCorporation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'vehicle-selection' | 'project'>('home');
  const [selectedCorp, setSelectedCorp] = useState<VehicleCorporation | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<AudioComponent[]>([]);
  const [vehicleSpecs, setVehicleSpecs] = useState<any>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  const handleRemoveComponent = (nodeIdToRemove: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeIdToRemove));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeIdToRemove && edge.target !== nodeIdToRemove));
    setSelectedComponents((comps) => comps.filter((comp) => `node-${comp.id}` !== nodeIdToRemove));
  };

  useEffect(() => {
    if (!selectedMake) return;

    const model = selectedMake === 'Ford' ? 'F-150' : 'Tacoma';

    fetch(`http://localhost:3001/api/specs/${selectedMake}/${model}`)
      .then(res => res.json())
      .then(data => {
        if (data.speakers) {
          setVehicleSpecs(data);
        }
      })
      .catch(err => console.error('Failed to fetch specs', err));

  }, [selectedMake]);

  useEffect(() => {
    fetch('http://localhost:3001/api/vehicles')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setVehicleData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching vehicle data:', error);
        setError('Failed to load vehicle data. Please make sure the backend server is running.');
        setLoading(false);
      });
  }, []);

  const totalRms = selectedComponents.reduce((total, comp) => total + (comp.specs?.rms_wattage || 0), 0);

  const handleAddComponent = (component: AudioComponent) => {
    const newNodeId = `node-${nodeId++}`;
    setSelectedComponents(prev => [...prev, component]);

    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position: { x: Math.random() * 400 - 200, y: Math.random() * 200 + 200 },
      data: { label: component.name, onRemove: handleRemoveComponent, id: newNodeId },
    };
    setNodes(nds => nds.concat(newNode));
  };

  const handleSelectMake = (make: string) => {
    setSelectedMake(make);
    setView('project');
  };

  const handleBackToVehicleList = () => {
    setSelectedMake(null);
    setVehicleSpecs(null);
    setView('vehicle-selection');
    setSelectedCorp(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="home-view">
            <h2>Design Your Perfect Car Audio System</h2>
            <p>From wiring diagrams to component selection, we've got you covered.</p>
            <button onClick={() => setView('vehicle-selection')} className="start-button">
              Start Your Project
            </button>
          </div>
        );
      case 'vehicle-selection':
        if (loading) return <p>Loading vehicle list...</p>;
        if (error) return <p className="error">{error}</p>;

        return selectedCorp ? (
          <div className="make-list">
            <button onClick={() => setSelectedCorp(null)} className="back-button">← Back to Brands</button>
            <h3>{selectedCorp.corporation}</h3>
            <ul>
              {selectedCorp.makes.map((make, index) => (
                <li key={index} onClick={() => handleSelectMake(make)}>
                  {make}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="vehicle-grid">
            {vehicleData.map(corp => (
              <div key={corp.corporation} className="corp-card" onClick={() => setSelectedCorp(corp)}>
                <span>{corp.corporation}</span>
              </div>
            ))}
          </div>
        );

      case 'project':
        return (
          <div>
            <button onClick={handleBackToVehicleList} className="back-button">← Back to Vehicle List</button>
            <div className="project-view">
              <div className="main-content">
                <WiringDiagram 
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                />
              </div>
              <aside className="sidebar">
                <ProjectSummary selectedComponents={selectedComponents} />
                <WireGaugeCalculator totalRms={totalRms} />
                <ComponentBrowser onAddComponent={handleAddComponent} vehicleSpecs={vehicleSpecs} />
              </aside>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Car Audio Web Tool</h1>
        {view === 'project' && selectedMake && (
          <p>System for a <strong>{selectedMake}</strong></p>
        )}
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;