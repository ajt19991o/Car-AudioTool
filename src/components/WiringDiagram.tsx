
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow';
import { useMemo } from 'react';
import './WiringDiagram.css';

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
    <div className="wiring-diagram">
      <ReactFlowProvider>
        <DiagramInner
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default WiringDiagram;

interface DiagramInnerProps extends WiringDiagramProps {}

const EDGE_LABELS: Record<string, string> = {
  power: 'Power Feed (12V)',
  signal: 'Low-Level Signal',
  remote: 'Remote Turn-On',
  ground: 'Chassis Ground',
};

const EDGE_COLORS: Record<string, string> = {
  power: '#ef4444',
  signal: '#0ea5e9',
  remote: '#6366f1',
  ground: '#334155',
};

function DiagramInner({ nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes }: DiagramInnerProps) {
  const reactFlow = useReactFlow();

  const legendItems = useMemo(() =>
    Object.entries(EDGE_LABELS).map(([key, label]) => ({ key, label, color: EDGE_COLORS[key] || '#94a3b8' })),
  []);

  return (
    <>
      <div className="wiring-toolbar">
        <button type="button" onClick={() => reactFlow.fitView({ padding: 0.2 })}>
          Fit View
        </button>
        <div className="wiring-toolbar__spacer" />
        <button type="button" onClick={() => reactFlow.zoomOut()}>-</button>
        <button type="button" onClick={() => reactFlow.zoomIn()}>+</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={{ zoom: 1, x: 0, y: 0 }}
        minZoom={0.4}
        maxZoom={1.6}
      >
        <MiniMap
          nodeColor={(node) => {
            const kind = (node.data as any)?.kind ?? 'device';
            return EDGE_COLORS[kind] ?? '#4b5563';
          }}
          style={{ backgroundColor: 'var(--color-bg, #0f172a)', borderRadius: '8px' }}
        />
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} />
      </ReactFlow>
      <div className="wiring-legend" aria-label="Wiring legend">
        {legendItems.map(item => (
          <div key={item.key} className="wiring-legend__item">
            <span className="wiring-legend__swatch" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
