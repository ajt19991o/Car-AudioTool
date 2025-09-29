import React from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

function CustomNode({ data }) {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div className="custom-node-content">
        <div className="custom-node-label">{data.label}</div>
        <button className="custom-node-delete-button" onClick={() => data.onRemove(data.id)}>
          ×
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default CustomNode;
