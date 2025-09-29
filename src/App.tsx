import { useState, useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import './App.css';
import WiringDiagram from './components/WiringDiagram';
import ComponentBrowser from './components/ComponentBrowser';
import Budget from './components/Budget';

// Define data structures
interface VehicleCorporation {
  corporation: string;
  makes: string[];
}
interface AudioComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
}

const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Car Battery' }, type: 'input' },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Head Unit' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: '12V Power' },
];

let nodeId = 3;

function App() {
  const [vehicleData, setVehicleData] = useState<VehicleCorporation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<AudioComponent[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

  const handleAddComponent = (component: AudioComponent) => {
    setSelectedComponents(prev => [...prev, component]);

    const newNode: Node = {
      id: `node-${nodeId++}`,
      position: { x: Math.random() * 400 - 200, y: Math.random() * 200 + 200 },
      data: { label: component.name },
    };
    setNodes(nds => nds.concat(newNode));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Car Audio Web Tool</h1>
        {selectedMake ? (
          <p>System for a <strong>{selectedMake}</strong></p>
        ) : (
          <p>Select Your Vehicle</p>
        )}
      </header>
      <main>
        {loading && <p>Loading vehicle list...</p>}
        {error && <p className="error">{error}</p>}

        {!selectedMake ? (
          <div className="vehicle-list">
            {vehicleData.map(corp => (
              <details key={corp.corporation} className="corporation-item">
                <summary>{corp.corporation}</summary>
                <ul>
                  {corp.makes.map((make, index) => (
                    <li key={index} onClick={() => setSelectedMake(make)}>
                      {make}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedMake(null)} className="back-button">← Back to Vehicle List</button>
            <div className="project-view">
              <div className="main-content">
                <WiringDiagram 
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                />
              </div>
              <aside className="sidebar">
                <Budget selectedComponents={selectedComponents} />
                <ComponentBrowser onAddComponent={handleAddComponent} />
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
