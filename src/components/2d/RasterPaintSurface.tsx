import { useEffect, useRef, useMemo } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { WORKSPACE_CONFIG } from '../../config/workspace';

export const RasterPaintSurface = () => {
  const imageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // useMemo ensures we only create this memory-heavy canvas exactly once per mount
  const canvas = useMemo(() => {
    const cvs = document.createElement('canvas');
    cvs.width = WORKSPACE_CONFIG.logicalWidth;
    cvs.height = WORKSPACE_CONFIG.logicalHeight;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
    }
    return cvs;
  }, []);

  // Cleanup to prevent memory leaks on unmount
  useEffect(() => {
    return () => {
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [canvas]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    lastPos.current = e.target.getStage().getPointerPosition();
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !lastPos.current) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const ctx = canvas.getContext('2d');

    if (ctx && pos) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      lastPos.current = pos;
      
      // Highly optimized Konva redraw
      if (imageRef.current) {
        imageRef.current.getLayer().batchDraw();
      }
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  return (
    <KonvaImage
      ref={imageRef}
      image={canvas}
      x={0}
      y={0}
      width={WORKSPACE_CONFIG.logicalWidth}
      height={WORKSPACE_CONFIG.logicalHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      listening={true} // Forces Konva to catch events even if pixel is transparent
    />
  );
};