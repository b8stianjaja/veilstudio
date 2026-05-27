import { useState, useRef } from 'react';
import { Line } from 'react-konva';
import { useStudioStore } from '../../store/useStudioStore';

interface ArtistPaintSurfaceProps {
  layerId: string;
  lines: any[];
}

export const ArtistPaintSurface: React.FC<ArtistPaintSurfaceProps> = ({ layerId, lines }) => {
  // Changed from useState to useRef to fix the TS2339 and TS6133 errors
  const isDrawing = useRef(false); 
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const addLine = useStudioStore((state) => state.addLine);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLine([pos.x, pos.y]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setCurrentLine((prev) => [...prev, point.x, point.y]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentLine.length > 2) {
      addLine(layerId, { points: currentLine, stroke: '#ffffff', strokeWidth: 3 });
    }
    setCurrentLine([]);
  };

  return (
    <>
      {/* Invisible background rect to catch drawing events across the whole stage */}
      <Line
        points={[0, 0, 1920, 0, 1920, 1080, 0, 1080]}
        closed
        fill="transparent"
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Render saved lines from Zustand store */}
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
        />
      ))}

      {/* Render the active line currently being drawn */}
      {currentLine.length > 0 && (
        <Line
          points={currentLine}
          stroke="#ffffff"
          strokeWidth={3}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
        />
      )}
    </>
  );
};