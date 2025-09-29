import { Handle, Position } from 'reactflow';
import './CustomNode.css';

interface CustomNodeData {
  label: string;
  onRemove: (payload: { nodeId: string; componentId?: string }) => void;
  nodeId: string;
  componentId?: string;
  subtitle?: string;
  hint?: string;
}

function CustomNode({ data }: { data: CustomNodeData }) {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div className="custom-node-content">
        <div className="custom-node-labels">
          <div className="custom-node-label">{data.label}</div>
          {data.subtitle && <div className="custom-node-subtitle">{data.subtitle}</div>}
        </div>
        <button
          className="custom-node-delete-button"
          onClick={() => data.onRemove({ nodeId: data.nodeId, componentId: data.componentId })}
        >
          ×
        </button>
      </div>
      {data.hint && <div className="custom-node-hint">{data.hint}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default CustomNode;
