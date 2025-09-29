
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, OnNodesChange, OnEdgesChange } from 'reactflow';

interface WiringDiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
}

function WiringDiagram({ nodes, edges, onNodesChange, onEdgesChange }: WiringDiagramProps) {
  return (
    <div style={{ height: '500px', border: '1px solid #444', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default WiringDiagram;
