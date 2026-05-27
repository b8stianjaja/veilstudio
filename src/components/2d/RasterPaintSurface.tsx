import { useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useStudioStore } from '../../store/useStudioStore';

export const RasterPaintSurface = () => {
  const imageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  
  // OPTIMIZATION: Strict selectors. We only subscribe to width and height.
  // The component will no longer re-render if 3D nodes or Workspace Modes change.
  const width = useStudioStore((state) => state.canvasSettings.width);
  const height = useStudioStore((state) => state.canvasSettings.height);

  // PERSISTENCE: We use a ref to hold the canvas element permanently. 
  // It survives re-renders and React lifecycle changes.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize the canvas only once
  if (!canvasRef.current) {
    const cvs = document.createElement('canvas');
    cvs.width = width;
    cvs.height = height;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
    }
    canvasRef.current = cvs;
  }

  // SURGICAL FIX: The Resize & Rescue Operation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip if dimensions haven't actually changed
    if (canvas.width === width && canvas.height === height) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 1. Snapshot the existing artwork before the canvas resizes
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 2. Apply new dimensions (Warning: This natively wipes the HTML5 Canvas)
    canvas.width = width;
    canvas.height = height;

    // 3. Re-apply context settings because resizing clears them
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    // 4. Restore the artwork perfectly in the top-left corner
    ctx.putImageData(snapshot, 0, 0);

    // 5. Force Konva to flush the updated buffer to the screen
    if (imageRef.current) {
      imageRef.current.getLayer()?.batchDraw();
    }
  }, [width, height]); // Only runs when dimensions change

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    lastPos.current = e.target.getStage().getPointerPosition();
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !lastPos.current) return;
    
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    if (ctx && pos) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      lastPos.current = pos;
      
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
      image={canvasRef.current || undefined}
      x={0}
      y={0}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      listening={true}
    />
  );
};