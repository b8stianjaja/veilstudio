import { create } from 'zustand';
import { WORKSPACE_CONFIG, type WorkspaceMode, type RenderMode } from '../config/workspace';

// --- Types ---
export interface SceneNode {
  id: string;
  type: 'cube' | 'sphere';
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  zoom: number;
}

export interface LayerData {
  id: string;
  visible: boolean;
  opacity: number;
  lines: any[];
}

interface StudioState {
  // Phase & Tools
  workspace: WorkspaceMode;
  tools: { active: string; renderMode: RenderMode };
  canvasSettings: { showGrid: boolean };
  
  // 2D State
  konvaLayers: LayerData[];
  
  // 3D State
  threeState: {
    ambient: number;
    lightPos: [number, number, number];
    nodes: SceneNode[];
    activeCamera: CameraPreset | null;
    selectedNodeId: string | null;
  };

  // Actions
  setWorkspace: (mode: WorkspaceMode) => void;
  setRenderMode: (mode: RenderMode) => void;
  toggleGrid: () => void;
  addLine: (layerId: string, line: any) => void;
  saveCameraPreset: (preset: CameraPreset) => void;
  setSelectedNode: (id: string | null) => void;
  addNode: (type: 'cube' | 'sphere') => void;
  updateNode: (id: string, updates: Partial<SceneNode>) => void;
  removeNode: (id: string) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  workspace: 'MODELING',
  tools: { active: 'brush', renderMode: 'RASTER' }, // Default to performant raster
  canvasSettings: { showGrid: true },
  
  konvaLayers: [{ id: 'Layer 1', visible: true, opacity: 1.0, lines: [] }],

  threeState: {
    ambient: WORKSPACE_CONFIG.defaultAmbientLight,
    lightPos: WORKSPACE_CONFIG.defaultLightPosition,
    nodes: [{ id: "mesh_01", type: "cube", position: [0, 0, 0], scale: [2, 4, 2], rotation: [0, 0, 0] }],
    activeCamera: null,
    selectedNodeId: null,
  },

  setWorkspace: (mode) => set({ workspace: mode }),
  setRenderMode: (mode) => set((state) => ({ tools: { ...state.tools, renderMode: mode } })),
  toggleGrid: () => set((state) => ({ canvasSettings: { showGrid: !state.canvasSettings.showGrid } })),
  
  addLine: (layerId, line) => set((state) => ({
    konvaLayers: state.konvaLayers.map(layer => 
      layer.id === layerId ? { ...layer, lines: [...layer.lines, line] } : layer
    )
  })),

  saveCameraPreset: (preset) => set((state) => ({ threeState: { ...state.threeState, activeCamera: preset } })),
  setSelectedNode: (id) => set((state) => ({ threeState: { ...state.threeState, selectedNodeId: id } })),
  
  addNode: (type) => set((state) => {
    const newNode: SceneNode = {
      id: `${type}_${Date.now().toString().slice(-4)}`,
      type,
      position: [0, 0, 0],
      scale: type === 'cube' ? [2, 2, 2] : [1, 1, 1],
      rotation: [0, 0, 0]
    };
    return { threeState: { ...state.threeState, nodes: [...state.threeState.nodes, newNode], selectedNodeId: newNode.id } };
  }),

  updateNode: (id, updates) => set((state) => ({
    threeState: { ...state.threeState, nodes: state.threeState.nodes.map(node => node.id === id ? { ...node, ...updates } : node) }
  })),

  removeNode: (id) => set((state) => ({
    threeState: {
      ...state.threeState,
      nodes: state.threeState.nodes.filter(node => node.id !== id),
      selectedNodeId: state.threeState.selectedNodeId === id ? null : state.threeState.selectedNodeId
    }
  })),
}));