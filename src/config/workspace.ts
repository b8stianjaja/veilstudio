export const WORKSPACE_CONFIG = {
  // Logical workspace resolution for 2D/3D alignment
  logicalWidth: 1920,
  logicalHeight: 1080,
  aspectRatio: 1920 / 1080,
  
  // Default Scene settings
  defaultAmbientLight: 0.5,
  defaultLightPosition: [12.5, 8.2, 25.0] as [number, number, number],
};

export type WorkspaceMode = 'MODELING' | 'PAINTING';
export type RenderMode = 'RASTER' | 'VECTOR';