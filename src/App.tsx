import { useState } from 'react';
import { useStudioStore, type NodeType } from './store/useStudioStore';
import { ViewportFrame } from './layout/ViewportFrame';
import { ReferenceScene } from './components/3d/ReferenceScene';
import { PaintingStage } from './components/2d/PaintingStage';
import { exportCleanArtwork, exportProjectJSON } from './utils/exportPipelines';
import './App.css';

export default function StudioAppContainer() {
  const store = useStudioStore(); 
  const [newViewName, setNewViewName] = useState('');

  const { threeState, canvasSettings } = store;
  const { lights, selectedNodeId, nodes, savedViews } = threeState;
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    const cameraData = (window as any).__getCurrentCameraData?.();
    if (cameraData) {
      store.saveCurrentView(newViewName, cameraData);
      setNewViewName('');
    }
  };

  const handleLoadView = (view: any) => {
    (window as any).__loadCameraView?.(view.position, view.target, view.zoom);
  };

  return (
    <div className="studio-app">
      
      {/* LEFT TOOLBAR */}
      <aside className="toolbar left-toolbar">
        <div className="tool-group">
          <button className={`tool-btn ${store.workspace === 'MODELING' ? 'active' : ''}`} onClick={() => store.setWorkspace('MODELING')}>
            3D Blockout
          </button>
          <button className={`tool-btn ${store.workspace === 'PAINTING' ? 'active' : ''}`} onClick={() => store.setWorkspace('PAINTING')}>
            2D Painting
          </button>
        </div>

        <div className="tool-group bottom-actions">
          <button className="action-btn" onClick={() => exportProjectJSON(store)}>Save JSON</button>
          <button className="action-btn success" disabled={store.workspace !== 'PAINTING'} onClick={exportCleanArtwork}>
            Export PNG
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="workspace-container">
        <ViewportFrame>
          <ReferenceScene />
          <PaintingStage />
        </ViewportFrame>
      </main>

      {/* RIGHT INSPECTOR PANEL */}
      <aside className="inspector-panel">
        <header className="inspector-header">
          <h2>Veil Studio</h2>
          <span className="badge">{store.workspace}</span>
        </header>

        <div className="inspector-content">
          
          <section className="panel-section">
            <h3>Dimensions</h3>
            <div className="button-row">
              <input type="number" className="small-input" value={canvasSettings.width} onChange={(e) => store.setDimensions(Number(e.target.value), canvasSettings.height)} />
              <span>x</span>
              <input type="number" className="small-input" value={canvasSettings.height} onChange={(e) => store.setDimensions(canvasSettings.width, Number(e.target.value))} />
            </div>
          </section>

          {store.workspace === 'MODELING' && (
            <>
              {/* --- CUSTOM CAMERA VIEWS --- */}
              <section className="panel-section">
                <h3>Saved Camera Views</h3>
                <div className="button-row">
                  <input type="text" placeholder="View name..." value={newViewName} onChange={e => setNewViewName(e.target.value)} />
                  <button className="secondary-btn" onClick={handleSaveView}>Save</button>
                </div>
                {savedViews.length > 0 && (
                  <ul className="view-list" style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                    {savedViews.map(view => (
                      <li key={view.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <button className="text-btn" onClick={() => handleLoadView(view)}>{view.name}</button>
                        <button className="danger-btn small" onClick={() => store.deleteSavedView(view.id)}>X</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Advanced Lighting System */}
              <section className="panel-section">
                <h3>Environment Lighting</h3>
                <div className="button-row">
                  <label>Ambient <input type="color" value={lights.ambientColor} onChange={e => store.updateLights({ ambientColor: e.target.value })} /></label>
                  <label>Sun <input type="color" value={lights.dirColor} onChange={e => store.updateLights({ dirColor: e.target.value })} /></label>
                </div>
              </section>

              <section className="panel-section">
                <h3>Add Geometry</h3>
                <div className="button-row" style={{ flexWrap: 'wrap' }}>
                  {['cube', 'sphere', 'cylinder', 'cone', 'plane'].map(type => (
                    <button key={type} className="secondary-btn" onClick={() => store.addNode(type as NodeType)}>+ {type}</button>
                  ))}
                </div>
              </section>
              
              {selectedNode && (
                <section className="panel-section active-item-card">
                  <h3>Selected: {selectedNode.type}</h3>
                  <label>Color: <input type="color" value={selectedNode.color} onChange={e => store.updateNode(selectedNode.id, { color: e.target.value })} /></label>
                  <div className="button-row">
                    <button className="secondary-btn" onClick={() => store.duplicateNode(selectedNode.id)}>Duplicate</button>
                    <button className="danger-btn" onClick={() => store.removeNode(selectedNode.id)}>Delete</button>
                  </div>
                </section>
              )}
            </>
          )}

          {store.workspace === 'PAINTING' && (
            <>
              <section className="panel-section">
                <h3>Engine Rendering</h3>
                <button className="secondary-btn full-width" onClick={() => store.setRenderMode(store.tools.renderMode === 'RASTER' ? 'VECTOR' : 'RASTER')}>
                  Mode: {store.tools.renderMode}
                </button>
              </section>

              <section className="panel-section">
                <label className="checkbox-label">
                  <input type="checkbox" checked={store.canvasSettings.showGrid} onChange={store.toggleGrid} />
                  Show Alignment Grid
                </label>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}