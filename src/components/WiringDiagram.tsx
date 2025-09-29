
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';

const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Car Battery' }, type: 'input' },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Head Unit' } },
  { id: '3', position: { x: -150, y: 200 }, data: { label: 'Front Left Speaker' } },
  { id: '4', position: { x: 150, y: 200 }, data: { label: 'Front Right Speaker' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: '12V Power' },
  { id: 'e2-3', source: '2', target: '3', label: 'Speaker Wire' },
  { id: 'e2-4', source: '2', target: '4', label: 'Speaker Wire' },
];

function WiringDiagram() {
  return (
    <div style={{ height: '500px', border: '1px solid #444', borderRadius: '8px' }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default WiringDiagram;
