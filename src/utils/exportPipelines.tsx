import { WORKSPACE_CONFIG } from '../config/workspace';

// 1. Pure Layer Asset Exporting (Artwork Only)
export const exportCleanArtwork = () => {
  // We grab the Konva stage directly from the DOM
  const stageElement = document.getElementById('konva-stage');
  
  if (!stageElement) {
    alert("Must be in 2D PAINTING phase to export artwork.");
    return;
  }

  // Access the internal Konva instance attached to the DOM node
  const stage = (stageElement as any)._stage;
  
  if (stage) {
    // Execute native stage.toDataURL() bypassing R3F completely
    const dataURL = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 1 });
    
    // Trigger browser download
    const link = document.createElement('a');
    link.download = 'veil-studio-artwork.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 2. Lossless Project Serialization (JSON State Document)
export const exportProjectJSON = (currentState: any) => {
  // Format the raw Zustand state into the exact schema defined in the specification
  const projectDocument = {
    projectMetadata: {
      exportedAt: new Date().toISOString(),
    },
    version: "1.0.0",
    canvasDimensions: { 
      width: WORKSPACE_CONFIG.logicalWidth, 
      height: WORKSPACE_CONFIG.logicalHeight 
    },
    cameraPreset: currentState.threeState.activeCamera || {
      position: [12.5, 8.2, 25.0],
      target: [0.0, 0.0, 0.0],
      fov: 45,
      zoom: 1.0
    },
    threeScene: {
      lighting: { 
        ambientIntensity: currentState.threeState.ambient, 
        directionalColor: "#ffffff" 
      },
      dummyNodes: currentState.threeState.nodes
    },
    konvaStage: {
      attrs: { width: WORKSPACE_CONFIG.logicalWidth, height: WORKSPACE_CONFIG.logicalHeight },
      className: "Stage",
      children: currentState.konvaLayers.map((layer: any) => ({
        className: "Layer",
        attrs: { id: layer.id, visible: layer.visible, opacity: layer.opacity },
        children: layer.lines.map((line: any) => ({
          className: "Line",
          attrs: { points: line.points, stroke: line.stroke, strokeWidth: line.strokeWidth }
        }))
      }))
    }
  };

  // Convert to JSON and trigger download
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectDocument, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "veil-studio-project.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};