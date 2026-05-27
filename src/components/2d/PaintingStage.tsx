import { Stage, Layer, Rect } from 'react-konva';
import { useStudioStore } from '../../store/useStudioStore';
import { ArtistPaintSurface } from './ArtistPaintSurface';
import { RasterPaintSurface } from './RasterPaintSurface';

export const PaintingStage = () => {
  const { workspace, konvaLayers, canvasSettings, tools } = useStudioStore();
  
  if (workspace !== 'PAINTING') return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <Stage 
        id="konva-stage" 
        width={canvasSettings.width} 
        height={canvasSettings.height}
      >
        {canvasSettings.showGrid && (
          <Layer listening={false}>
            <Rect 
              width={canvasSettings.width} 
              height={canvasSettings.height} 
              stroke="rgba(255,255,255,0.1)" 
              dash={[10, 10]}
            />
          </Layer>
        )}
        
        {konvaLayers.map((layer) => (
          <Layer key={layer.id} visible={layer.visible} opacity={layer.opacity}>
             {/* Removed layerId from RasterPaintSurface */}
             {tools.renderMode === 'RASTER' ? (
               <RasterPaintSurface /> 
             ) : (
               <ArtistPaintSurface layerId={layer.id} lines={layer.lines} />
             )}
          </Layer>
        ))}
      </Stage>
    </div>
  );
};