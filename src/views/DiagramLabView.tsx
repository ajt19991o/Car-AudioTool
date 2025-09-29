import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  ReactFlowProvider,
} from 'reactflow';
import { useAppStore } from '../state/useAppStore';
import type { LibraryComponent } from '../state/useAppStore';
import CustomNode, { type NodeKind } from '../components/CustomNode';
import './DiagramLabView.css';

type EditableNodeData = {
  label: string;
  subtitle?: string;
  hint?: string;
  kind?: NodeKind;
};

const nodeTypes = {
  custom: CustomNode,
};

const KIND_OPTIONS: NodeKind[] = ['power', 'ground', 'signal', 'remote', 'device', 'accessory'];

const DEFAULT_POSITION = { x: 120, y: 80 };

interface DiagramLabState {
  nodes: Node[];
  edges: Edge[];
  counter: number;
}

const DIAGRAM_LAB_STORAGE_KEY = 'diagram-lab-state-v1';

function deserializeState(serialized: string, handlers: {
  onRemove: (payload: { nodeId: string }) => void;
  onEdit: (nodeId: string) => void;
}): DiagramLabState {
  try {
    const parsed = JSON.parse(serialized) as DiagramLabState;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return { nodes: [], edges: [], counter: 1 };
    }

    const nodes = parsed.nodes.map((node) => ({
      ...node,
      data: {
        ...(node.data || {}),
        onRemove: ({ nodeId }: { nodeId: string }) => handlers.onRemove({ nodeId }),
        onEditRequest: () => handlers.onEdit(node.id),
        nodeId: node.id,
      },
    }));

    const edges = parsed.edges.map(edge => ({ ...edge }));
    return {
      nodes,
      edges,
      counter: typeof parsed.counter === 'number' && parsed.counter > 0 ? parsed.counter : nodes.length + 1,
    };
  } catch (error) {
    console.warn('Failed to parse diagram lab state', error);
    return { nodes: [], edges: [], counter: 1 };
  }
}

function serializeState(state: DiagramLabState) {
  try {
    const nodes = state.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onRemove: undefined,
        onEditRequest: undefined,
      },
    }));
    const edges = state.edges.map(edge => ({ ...edge }));
    return JSON.stringify({ nodes, edges, counter: state.counter });
  } catch (error) {
    console.warn('Failed to serialize diagram lab state', error);
    return null;
  }
}

function guessKindFromLibrary(component: LibraryComponent): NodeKind {
  const type = component.type.toLowerCase();
  const category = component.category.toLowerCase();

  if (type.includes('amp') || category.includes('power')) return 'power';
  if (type.includes('ground')) return 'ground';
  if (type.includes('remote')) return 'remote';
  if (type.includes('signal') || type.includes('speaker') || category.includes('signal')) return 'signal';
  if (type.includes('access') || category.includes('access')) return 'accessory';
  return 'device';
}

const createEdgeStyle = () => ({
  stroke: 'var(--color-muted, #5f6c85)',
  strokeWidth: 1.4,
});

function DiagramLabView() {
  const libraryComponents = useAppStore(state => state.libraryComponents);
  const addLibraryComponent = useAppStore(state => state.addLibraryComponent);
  const removeLibraryComponent = useAppStore(state => state.removeLibraryComponent);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [libraryDraft, setLibraryDraft] = useState({ name: '', type: '', category: '', notes: '' });

  const counterRef = useRef(1);

  const handleRemoveNode = useCallback(({ nodeId }: { nodeId: string }) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(current => (current === nodeId ? null : current));
  }, [setEdges, setNodes]);

  const handleSelectForEdit = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(DIAGRAM_LAB_STORAGE_KEY);
    if (!stored) return;
    const state = deserializeState(stored, {
      onRemove: handleRemoveNode,
      onEdit: handleSelectForEdit,
    });
    counterRef.current = state.counter;
    setNodes(state.nodes);
    setEdges(state.edges);
  }, [handleRemoveNode, handleSelectForEdit, setEdges, setNodes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const serialized = serializeState({ nodes, edges, counter: counterRef.current });
    if (!serialized) return;
    window.localStorage.setItem(DIAGRAM_LAB_STORAGE_KEY, serialized);
  }, [edges, nodes]);

  const handleAddNodeFromLibrary = useCallback((component: LibraryComponent) => {
    const nodeId = `lab-node-${counterRef.current++}`;
    const position = {
      x: DEFAULT_POSITION.x + Math.random() * 260,
      y: DEFAULT_POSITION.y + Math.random() * 220,
    };
    const kind = guessKindFromLibrary(component);
    const newNode: Node = {
      id: nodeId,
      type: 'custom',
      position,
      data: {
        label: component.name,
        subtitle: component.category,
        hint: component.notes,
        kind,
        nodeId,
        componentId: component.id,
        onRemove: ({ nodeId: toRemove }: { nodeId: string }) => handleRemoveNode({ nodeId: toRemove }),
        onEditRequest: () => handleSelectForEdit(nodeId),
        isEditable: true,
      },
    };
    setNodes(nds => nds.concat(newNode));
    setSelectedNodeId(nodeId);
  }, [handleRemoveNode, handleSelectForEdit, setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({
      ...connection,
      style: createEdgeStyle(),
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--color-muted, #5f6c85)',
        width: 14,
        height: 14,
      },
    }, eds));
  }, [setEdges]);

  const selectedNode = useMemo(() => nodes.find(node => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  const handleNodeChange = useCallback((nodeId: string, updates: EditableNodeData) => {
    setNodes(nds => nds.map(node => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        data: {
          ...(node.data || {}),
          ...updates,
        },
      };
    }));
  }, [setNodes]);

  const handleClearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    counterRef.current = 1;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DIAGRAM_LAB_STORAGE_KEY);
    }
  }, [setEdges, setNodes]);

  const handleLibrarySubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!libraryDraft.name.trim() || !libraryDraft.type.trim() || !libraryDraft.category.trim()) {
      return;
    }
    const newComponent: LibraryComponent = {
      id: `custom-lib-${Date.now()}`,
      name: libraryDraft.name.trim(),
      type: libraryDraft.type.trim(),
      category: libraryDraft.category.trim(),
      notes: libraryDraft.notes.trim() ? libraryDraft.notes.trim() : undefined,
      isCustom: true,
    };
    addLibraryComponent(newComponent);
    setLibraryDraft({ name: '', type: '', category: '', notes: '' });
  }, [addLibraryComponent, libraryDraft]);

  const selectedData = selectedNode?.data as EditableNodeData | undefined;

  return (
    <div className="diagram-lab-view">
      <div className="diagram-lab-layout">
        <section className="diagram-library">
          <header>
            <h2>Basic Component Library</h2>
            <p>Add placeholders that you can later swap for real products.</p>
          </header>
          <form className="library-form" onSubmit={handleLibrarySubmit}>
            <h3>Add Your Own Placeholder</h3>
            <div className="field-grid">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={libraryDraft.name}
                  onChange={(event) => setLibraryDraft(draft => ({ ...draft, name: event.target.value }))}
                  placeholder="e.g. Secondary Amplifier"
                  required
                />
              </label>
              <label>
                <span>Type</span>
                <input
                  type="text"
                  value={libraryDraft.type}
                  onChange={(event) => setLibraryDraft(draft => ({ ...draft, type: event.target.value }))}
                  placeholder="amplifier"
                  required
                />
              </label>
              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={libraryDraft.category}
                  onChange={(event) => setLibraryDraft(draft => ({ ...draft, category: event.target.value }))}
                  placeholder="Power"
                  required
                />
              </label>
              <label className="field-notes">
                <span>Notes (optional)</span>
                <textarea
                  value={libraryDraft.notes}
                  onChange={(event) => setLibraryDraft(draft => ({ ...draft, notes: event.target.value }))}
                  placeholder="Remind yourself about mounting requirements"
                  rows={2}
                />
              </label>
            </div>
            <button type="submit" className="primary">Add To Library</button>
          </form>
          <div className="library-list">
            {libraryComponents.map(component => {
              const isCustom = Boolean(component.isCustom);
              return (
                <div key={component.id} className="library-item">
                  <div className="library-item__labels">
                    <strong>{component.name}</strong>
                    <span>{component.category}</span>
                    <small>{component.type}</small>
                    {component.notes && <p>{component.notes}</p>}
                  </div>
                  <div className="library-item__actions">
                    <button type="button" onClick={() => handleAddNodeFromLibrary(component)}>
                      Add To Diagram
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      disabled={!isCustom}
                      onClick={() => isCustom && removeLibraryComponent(component.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="diagram-workspace">
          <div className="workspace-header">
            <div>
              <h2>Diagram Workspace</h2>
              <p>Create a layout with placeholder components. Use the editor to rename, recategorize, or jot notes.</p>
            </div>
            <div className="workspace-actions">
              <button type="button" onClick={handleClearDiagram} className="ghost">Clear Diagram</button>
            </div>
          </div>
          <div className="diagram-canvas">
            <ReactFlowProvider>
              <DiagramCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onSelectionChange={setSelectedNodeId}
              />
            </ReactFlowProvider>
          </div>
        </section>
        <aside className="diagram-editor">
          <NodeEditorPanel
            nodeId={selectedNodeId}
            data={selectedData}
            onChange={handleNodeChange}
            onRemove={() => selectedNodeId && handleRemoveNode({ nodeId: selectedNodeId })}
          />
        </aside>
      </div>
    </div>
  );
}

interface DiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  nodeTypes: Record<string, any>;
  onSelectionChange: (nodeId: string | null) => void;
}

function DiagramCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes, onSelectionChange }: DiagramCanvasProps) {
  const handleSelection = useCallback((params: { nodes: Node[] }) => {
    const first = params.nodes?.[0];
    onSelectionChange(first ? first.id : null);
  }, [onSelectionChange]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onSelectionChange={handleSelection}
      fitView
      minZoom={0.4}
      maxZoom={1.6}
    >
      <MiniMap
        nodeColor={(node) => {
          const kind = (node.data as any)?.kind ?? 'device';
          switch (kind) {
            case 'power':
              return '#ef4444';
            case 'ground':
              return '#334155';
            case 'signal':
              return '#0ea5e9';
            case 'remote':
              return '#6366f1';
            case 'accessory':
              return '#f59e0b';
            default:
              return '#4b5563';
          }
        }}
      />
      <Controls showInteractive={false} />
      <Background variant={BackgroundVariant.Lines} gap={22} size={1} />
    </ReactFlow>
  );
}

interface NodeEditorPanelProps {
  nodeId: string | null;
  data?: EditableNodeData;
  onChange: (nodeId: string, updates: EditableNodeData) => void;
  onRemove: () => void;
}

function NodeEditorPanel({ nodeId, data, onChange, onRemove }: NodeEditorPanelProps) {
  const [localState, setLocalState] = useState<EditableNodeData>({ label: '', subtitle: '', hint: '', kind: 'device' });

  useEffect(() => {
    if (nodeId && data) {
      setLocalState({
        label: data.label ?? '',
        subtitle: data.subtitle ?? '',
        hint: data.hint ?? '',
        kind: data.kind ?? 'device',
      });
    } else {
      setLocalState({ label: '', subtitle: '', hint: '', kind: 'device' });
    }
  }, [data, nodeId]);

  const handleChange = useCallback(<K extends keyof EditableNodeData>(key: K, value: EditableNodeData[K]) => {
    setLocalState(prev => {
      const next = { ...prev, [key]: value };
      if (nodeId) {
        onChange(nodeId, next);
      }
      return next;
    });
  }, [nodeId, onChange]);

  if (!nodeId) {
    return (
      <div className="node-editor">
        <h2>Node Details</h2>
        <p>Select a node in the diagram to edit its details.</p>
      </div>
    );
  }

  return (
    <div className="node-editor">
      <div className="node-editor__header">
        <h2>Node Details</h2>
        <button type="button" className="ghost" onClick={onRemove}>Remove Node</button>
      </div>
      <label>
        <span>Label</span>
        <input
          type="text"
          value={localState.label}
          onChange={(event) => handleChange('label', event.target.value)}
        />
      </label>
      <label>
        <span>Subtitle</span>
        <input
          type="text"
          value={localState.subtitle ?? ''}
          onChange={(event) => handleChange('subtitle', event.target.value)}
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          rows={3}
          value={localState.hint ?? ''}
          onChange={(event) => handleChange('hint', event.target.value)}
        />
      </label>
      <label>
        <span>Connection Type</span>
        <select
          value={localState.kind ?? 'device'}
          onChange={(event) => handleChange('kind', event.target.value as NodeKind)}
        >
          {KIND_OPTIONS.map(kind => (
            <option key={kind} value={kind}>{kind}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default DiagramLabView;
