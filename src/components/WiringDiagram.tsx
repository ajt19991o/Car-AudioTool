
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, ReactFlowProvider } from 'reactflow';

interface WiringDiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  nodeTypes: any;
}

function WiringDiagram({ nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes }: WiringDiagramProps) {
  return (
    <div style={{ height: '500px', border: '1px solid #444', borderRadius: '8px' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default WiringDiagram;
