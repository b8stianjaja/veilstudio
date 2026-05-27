// src/App.tsx
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

  // Safe Camera Dispatcher (Replaces the global variable hack)
  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    
    const event = new CustomEvent('REQUEST_CAMERA_DATA', {
      detail: {
        callback: (cameraData: any) => {
          store.saveCurrentView(newViewName, cameraData);
          setNewViewName('');
        }
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="studio-app">
      {/* LEFT TOOLBAR */}
      <aside className="toolbar left-toolbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className={`tool-btn ${store.workspace === 'MODELING' ? 'active' : ''}`} onClick={() => store.setWorkspace('MODELING')}>3D Blockout</button>
          <button className={`tool-btn ${store.workspace === 'PAINTING' ? 'active' : ''}`} onClick={() => store.setWorkspace('PAINTING')}>2D Painting</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="action-btn" onClick={() => exportProjectJSON(store)}>Save JSON</button>
          <button className="action-btn success" disabled={store.workspace !== 'PAINTING'} onClick={exportCleanArtwork}>Export PNG</button>
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
            <h3>Canvas Dimensions</h3>
            <div className="input-group">
              <input type="number" className="panel-input" value={canvasSettings.width} onChange={(e) => store.updateCanvasSettings({ width: Number(e.target.value) })} />
              <span>x</span>
              <input type="number" className="panel-input" value={canvasSettings.height} onChange={(e) => store.updateCanvasSettings({ height: Number(e.target.value) })} />
            </div>
          </section>

          {store.workspace === 'MODELING' && (
            <>
              {/* SAVED CAMERAS REFACTORED */}
              <section className="panel-section">
                <h3>Saved Cameras</h3>
                <div className="input-group">
                  <input type="text" className="panel-input" placeholder="View name..." value={newViewName} onChange={e => setNewViewName(e.target.value)} />
                  <button className="secondary-btn" onClick={handleSaveView} style={{ flex: '0 0 auto' }}>Save</button>
                </div>
                
                {savedViews.length > 0 && (
                  <ul className="view-list">
                    {savedViews.map(view => (
                      <li key={view.id} className="view-item">
                        <button className="text-btn" onClick={() => store.triggerCameraLoad(view)}>{view.name}</button>
                        <button className="danger-btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => store.deleteSavedView(view.id)}>X</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel-section">
                <h3>Environment Lighting</h3>
                <div className="control-row">
                  <span>Ambient</span>
                  <input type="color" value={lights.ambientColor} onChange={e => store.updateLights({ ambientColor: e.target.value })} />
                </div>
                <div className="control-row">
                  <span>Sun</span>
                  <input type="color" value={lights.dirColor} onChange={e => store.updateLights({ dirColor: e.target.value })} />
                </div>
              </section>

              <section className="panel-section">
                <h3>Add Geometry</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['cube', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'tetrahedron'].map(type => (
                    <button key={type} className="secondary-btn" onClick={() => store.addNode(type as NodeType)}>{type}</button>
                  ))}
                </div>
              </section>
              
              {selectedNode && (
                <section className="panel-section active-item-card">
                  <h3 style={{ borderBottom: '1px solid #2c2e33', paddingBottom: '0.5rem' }}>Selected: {selectedNode.type}</h3>
                  
                  <div className="control-row" style={{ marginTop: '0.5rem' }}>
                    <span>Color</span>
                    <input type="color" value={selectedNode.color} onChange={e => store.updateNode(selectedNode.id, { color: e.target.value })} />
                  </div>
                  
                  <div className="control-row" style={{ marginTop: '0.5rem' }}>
                    <span>Roughness</span>
                    <input type="range" min="0" max="1" step="0.05" value={selectedNode.roughness} onChange={e => store.updateNode(selectedNode.id, { roughness: Number(e.target.value) })} />
                  </div>
                  
                  <div className="control-row" style={{ marginTop: '0.5rem' }}>
                    <span>Metalness</span>
                    <input type="range" min="0" max="1" step="0.05" value={selectedNode.metalness} onChange={e => store.updateNode(selectedNode.id, { metalness: Number(e.target.value) })} />
                  </div>

                  <label className="control-row" style={{ cursor: 'pointer', marginTop: '1rem', justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <input type="checkbox" checked={selectedNode.wireframe} onChange={e => store.updateNode(selectedNode.id, { wireframe: e.target.checked })} />
                    <span>Force Wireframe</span>
                  </label>

                  <div className="input-group" style={{ marginTop: '1rem' }}>
                    <button className="secondary-btn" onClick={() => store.duplicateNode(selectedNode.id)}>Duplicate</button>
                    <button className="danger-btn" style={{ flex: 1 }} onClick={() => store.removeNode(selectedNode.id)}>Delete</button>
                  </div>
                </section>
              )}
            </>
          )}

          {store.workspace === 'PAINTING' && (
            <>
              <section className="panel-section">
                <h3>Engine Rendering</h3>
                <button className="secondary-btn" onClick={() => store.setRenderMode(store.tools.renderMode === 'RASTER' ? 'VECTOR' : 'RASTER')}>
                  Active Mode: {store.tools.renderMode}
                </button>
              </section>

              <section className="panel-section">
                <h3>Visual Aids</h3>
                <label className="control-row" style={{ cursor: 'pointer', justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <input type="checkbox" checked={canvasSettings.showGrid} onChange={(e) => store.updateCanvasSettings({ showGrid: e.target.checked })} />
                  <span>Show Alignment Grid</span>
                </label>
                
                {canvasSettings.showGrid && (
                  <select 
                    className="panel-input" 
                    style={{ marginTop: '0.5rem' }}
                    value={canvasSettings.gridType} 
                    onChange={(e) => store.updateCanvasSettings({ gridType: e.target.value as 'cartesian' | 'isometric' })}
                  >
                    <option value="cartesian">Cartesian (Square)</option>
                    <option value="isometric">Isometric (30° Angle)</option>
                  </select>
                )}

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }}></div>

                <label className="control-row" style={{ cursor: 'pointer', justifyContent: 'flex-start', gap: '0.5rem' }}>
                  <input type="checkbox" checked={canvasSettings.onionSkinning} onChange={(e) => store.updateCanvasSettings({ onionSkinning: e.target.checked })} />
                  <span>Onion Skin (3D Trace)</span>
                </label>
                
                {canvasSettings.onionSkinning && (
                  <div className="control-row" style={{ marginTop: '0.5rem' }}>
                    <span>Opacity: {Math.round(canvasSettings.onionOpacity * 100)}%</span>
                    <input type="range" min="0.1" max="1" step="0.1" value={canvasSettings.onionOpacity} onChange={(e) => store.updateCanvasSettings({ onionOpacity: Number(e.target.value) })} />
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}