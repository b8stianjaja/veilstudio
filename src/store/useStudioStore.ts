// src/store/useStudioStore.ts
import { create } from 'zustand';
import { type WorkspaceMode, type RenderMode } from '../config/workspace';

export type NodeType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'tetrahedron';

export interface SceneNode {
  id: string;
  type: NodeType;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface LayerData {
  id: string;
  visible: boolean;
  opacity: number;
  lines: any[];
}

interface StudioState {
  workspace: WorkspaceMode;
  tools: { active: string; renderMode: RenderMode };
  canvasSettings: { 
    showGrid: boolean; 
    gridType: 'cartesian' | 'isometric'; 
    width: number; 
    height: number;
    onionSkinning: boolean;     
    onionOpacity: number;       
  };
  konvaLayers: LayerData[];
  
  threeState: {
    lights: { ambientIntensity: number; ambientColor: string; dirIntensity: number; dirColor: string; dirPosition: [number, number, number] };
    nodes: SceneNode[];
    selectedNodeId: string | null;
    savedViews: SavedView[];
    // NEW: Reactive camera trigger to replace the `window` hack
    cameraLoadTrigger: SavedView | null; 
  };

  setWorkspace: (mode: WorkspaceMode) => void;
  setRenderMode: (mode: RenderMode) => void;
  updateCanvasSettings: (updates: Partial<StudioState['canvasSettings']>) => void;
  addLine: (layerId: string, line: any) => void;
  setSelectedNode: (id: string | null) => void;
  addNode: (type: NodeType) => void;
  updateNode: (id: string, updates: Partial<SceneNode>) => void;
  duplicateNode: (id: string) => void;
  removeNode: (id: string) => void;
  updateLights: (updates: Partial<StudioState['threeState']['lights']>) => void;
  
  saveCurrentView: (name: string, cameraData: { position: [number,number,number], target: [number,number,number], zoom: number }) => void;
  deleteSavedView: (id: string) => void;
  triggerCameraLoad: (view: SavedView) => void;
  clearCameraTrigger: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  workspace: 'MODELING',
  tools: { active: 'brush', renderMode: 'RASTER' },
  canvasSettings: { showGrid: true, gridType: 'cartesian', width: 1920, height: 1080, onionSkinning: false, onionOpacity: 0.5 },
  konvaLayers: [{ id: 'Layer 1', visible: true, opacity: 1.0, lines: [] }],

  threeState: {
    lights: { ambientIntensity: 0.5, ambientColor: '#ffffff', dirIntensity: 1.5, dirColor: '#ffffff', dirPosition: [5, 5, 5] },
    nodes: [{ id: "mesh_01", type: "cube", position: [0, 0, 0], scale: [2, 4, 2], rotation: [0, 0, 0], color: '#888888', roughness: 0.7, metalness: 0.2, wireframe: false }],
    selectedNodeId: null,
    savedViews: [],
    cameraLoadTrigger: null,
  },

  setWorkspace: (mode) => set({ workspace: mode }),
  setRenderMode: (mode) => set((state) => ({ tools: { ...state.tools, renderMode: mode } })),
  updateCanvasSettings: (updates) => set((state) => ({ canvasSettings: { ...state.canvasSettings, ...updates } })),
  addLine: (layerId, line) => set((state) => ({ konvaLayers: state.konvaLayers.map(layer => layer.id === layerId ? { ...layer, lines: [...layer.lines, line] } : layer) })),
  updateLights: (updates) => set((state) => ({ threeState: { ...state.threeState, lights: { ...state.threeState.lights, ...updates } } })),
  setSelectedNode: (id) => set((state) => ({ threeState: { ...state.threeState, selectedNodeId: id } })),
  
  addNode: (type) => set((state) => {
    const newNode: SceneNode = { id: `${type}_${Date.now().toString().slice(-4)}`, type, position: [0, 0, 0], scale: type === 'plane' ? [5, 5, 1] : [2, 2, 2], rotation: type === 'plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0], color: '#aaaaaa', roughness: 0.7, metalness: 0.2, wireframe: false };
    return { threeState: { ...state.threeState, nodes: [...state.threeState.nodes, newNode], selectedNodeId: newNode.id } };
  }),

  updateNode: (id, updates) => set((state) => ({ threeState: { ...state.threeState, nodes: state.threeState.nodes.map(node => node.id === id ? { ...node, ...updates } : node) } })),
  
  duplicateNode: (id) => set((state) => {
    const target = state.threeState.nodes.find(n => n.id === id);
    if (!target) return state;
    return { threeState: { ...state.threeState, nodes: [...state.threeState.nodes, { ...target, id: `dup_${Date.now().toString().slice(-4)}`, position: [target.position[0] + 1, target.position[1], target.position[2]] }], selectedNodeId: target.id } };
  }),

  removeNode: (id) => set((state) => ({ threeState: { ...state.threeState, nodes: state.threeState.nodes.filter(node => node.id !== id), selectedNodeId: state.threeState.selectedNodeId === id ? null : state.threeState.selectedNodeId } })),

  saveCurrentView: (name, cameraData) => set((state) => ({
    threeState: { ...state.threeState, savedViews: [...state.threeState.savedViews, { id: `view_${Date.now()}`, name, ...cameraData }] }
  })),

  deleteSavedView: (id) => set((state) => ({ threeState: { ...state.threeState, savedViews: state.threeState.savedViews.filter(v => v.id !== id) } })),
  
  // Clean event bus for camera manipulation
  triggerCameraLoad: (view) => set((state) => ({ threeState: { ...state.threeState, cameraLoadTrigger: view } })),
  clearCameraTrigger: () => set((state) => ({ threeState: { ...state.threeState, cameraLoadTrigger: null } })),
}));