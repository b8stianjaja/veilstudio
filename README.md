# Veil Studio - Living Architecture

**Project Goal:** A highly customizable 3D/2D hybrid workspace for staging and drawing perfectly aligned art assets. The application exists to ease the artist's workflow by providing exact measures, grids, and 3D blockout references. 
**Final Output:** Strictly flat PNG images (spritesheets and map layers). **Veil Studio DOES NOT generate QMap or QSprite JSON configurations.**
**Tech Stack:** React, Zustand, React Three Fiber (R3F) + Drei, React-Konva.

## 🧭 1. Architectural Boundaries (The "Why")

### The 3D/2D Bridge (Art Assitance)
* **Separation of Concerns:** R3F is the "Photography Studio" (spatial logic, lighting, orthographic camera angles). Konva is the "Tracing Paper" (brush strokes, measuring grids, raster buffers). 
* **Exact Measures:** The primary technical goal of the bridge is guaranteeing a 1:1 mapping between 3D units and 2D pixels. The Orthographic Camera's zoom and the HTML Canvas dimensions must be strictly synced so the artist can trust the visual grids.
* **The Single Source of Truth:** Zustand (`useStudioStore`) is the bridge, storing **low-frequency data** (active tool, canvas dimensions, grid settings, and camera snapshots). 

## 🚫 2. Known Anti-Patterns (Danger Zones)

### React Three Fiber (WebGL)
* **The Camera Loop:** `OrbitControls` mutates the camera internally. Binding `<OrthographicCamera position={state.pos}>` to a reactive state while controls are active will cause a tug-of-war and freeze the app. 
  * *Solution:* Let R3F manage the camera natively. Only read/write the camera matrix via the manual "Saved Views" system to ensure repeatable, pixel-perfect angles for spritesheets.
* **Component Remounting:** Wrapping Three.js meshes inside inline components or higher-order controls forces React to destroy and rebuild WebGL buffers on every render.
  * *Solution:* Render meshes at the root level and attach controls via reference: `<TransformControls object={meshRef.current} />`.

### Zustand State Management
* **The High-Frequency Choke:** Pushing 60fps data (like a brush stroke array or an active drag coordinate) directly into Zustand will force the entire React tree to re-render, killing performance.
  * *Solution:* Keep active drawing/dragging state in local `useRef`s or `useState`. Only commit to Zustand on `onMouseUp` or `onDragEnd`.
* **Over-Subscription:** 2D canvas components should not re-render when a 3D light changes color. 
  * *Solution:* Always use strict slice selectors: `const width = useStudioStore(s => s.canvasSettings.width);`

### HTML Canvas (Konva)
* **The Resize Wipe:** Changing a DOM `<canvas>` width/height natively clears its buffer. 
  * *Solution:* Resizing logic must temporarily save the pixel matrix (`getImageData`), apply the new dimensions, and redraw (`putImageData`).

## 🏗 3. Extensibility Guidelines

* **Tooling Focus:** Any new features added should focus on visual aids (e.g., custom grid overlays, isometric rulers, silhouette modes, onion skinning for sprites) rather than data-export features.
* **Export Pipelines:** The only valid output format for this project is flattened PNG files (`exportCleanArtwork`). We do not export node arrays or spatial coordinates.