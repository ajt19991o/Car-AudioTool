import { Handle, Position } from 'reactflow';
import './CustomNode.css';

export type NodeKind = 'power' | 'ground' | 'signal' | 'remote' | 'device' | 'accessory';

interface CustomNodeData {
  label: string;
  onRemove: (payload: { nodeId: string; componentId?: string }) => void;
  nodeId: string;
  componentId?: string;
  subtitle?: string;
  hint?: string;
  kind?: NodeKind;
  isEditable?: boolean;
  onEditRequest?: (payload: { nodeId: string; componentId?: string }) => void;
}

const ICONS: Record<NodeKind, string> = {
  power: '⚡',
  ground: '⏚',
  signal: '🎚️',
  remote: '🔌',
  device: '🧩',
  accessory: '🧰',
};

function CustomNode({ data }: { data: CustomNodeData }) {
  const kind = data.kind ?? 'device';
  const icon = ICONS[kind];

  return (
    <div className={`custom-node custom-node--${kind}`}>
      <Handle type="target" position={Position.Top} />
      <div className="custom-node-content">
        <div className="custom-node-icon" aria-hidden="true">{icon}</div>
        <div className="custom-node-labels">
          <div className="custom-node-label">{data.label}</div>
          {data.subtitle && <div className="custom-node-subtitle">{data.subtitle}</div>}
        </div>
        <div className="custom-node-actions">
          {data.isEditable && data.onEditRequest && (
            <button
              className="custom-node-edit-button"
              onClick={() => data.onEditRequest?.({ nodeId: data.nodeId, componentId: data.componentId })}
              type="button"
              aria-label="Edit node"
            >
              ✎
            </button>
          )}
          <button
            className="custom-node-delete-button"
            onClick={() => data.onRemove({ nodeId: data.nodeId, componentId: data.componentId })}
            type="button"
            aria-label="Remove node"
          >
            ×
          </button>
        </div>
      </div>
      {data.hint && <div className="custom-node-hint">{data.hint}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default CustomNode;
