import { useStudioStore } from './store/useStudioStore';
import { ViewportFrame } from './layout/ViewportFrame';
import { ReferenceScene } from './components/3d/ReferenceScene';
import { PaintingStage } from './components/2d/PaintingStage';
import { exportCleanArtwork, exportProjectJSON } from './utils/exportPipelines';
import './App.css'; // We will move styling here for a cleaner component

export default function StudioAppContainer() {
  const store = useStudioStore(); 

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
          {/* 3D TOOLS */}
          {store.workspace === 'MODELING' && (
            <section className="panel-section">
              <h3>Scene Geometry</h3>
              <div className="button-row">
                <button className="secondary-btn" onClick={() => store.addNode('cube')}>+ Cube</button>
                <button className="secondary-btn" onClick={() => store.addNode('sphere')}>+ Sphere</button>
              </div>
              
              {store.threeState.selectedNodeId && (
                <div className="active-item-card">
                  <p>Selected: <strong>{store.threeState.selectedNodeId}</strong></p>
                  <button className="danger-btn" onClick={() => store.removeNode(store.threeState.selectedNodeId!)}>Delete Mesh</button>
                </div>
              )}
            </section>
          )}

          {/* 2D TOOLS */}
          {store.workspace === 'PAINTING' && (
            <>
              <section className="panel-section">
                <h3>Engine Rendering</h3>
                <button 
                  className="secondary-btn full-width"
                  onClick={() => store.setRenderMode(store.tools.renderMode === 'RASTER' ? 'VECTOR' : 'RASTER')}
                >
                  Mode: {store.tools.renderMode}
                </button>
                <p className="helper-text">
                  {store.tools.renderMode === 'RASTER' ? 'O(1) memory cost. Best for sketching.' : 'Editable math paths. Best for precision.'}
                </p>
              </section>

              <section className="panel-section">
                <h3>Canvas View</h3>
                <label className="checkbox-label">
                  <input type="checkbox" checked={store.canvasSettings.showGrid} onChange={store.toggleGrid} />
                  Show Perspective Grid
                </label>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}