import React, { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '../store/useStudioStore';

interface ViewportFrameProps {
  children: React.ReactNode;
}

export const ViewportFrame: React.FC<ViewportFrameProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { width, height } = useStudioStore((state) => state.canvasSettings);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = (clientWidth: number, clientHeight: number) => {
      // Scale based on the dynamic store dimensions
      const scaleX = clientWidth / width;
      const scaleY = clientHeight / height;
      // 0.95 gives us a clean 5% padding around the canvas
      setScale(Math.min(scaleX, scaleY) * 0.95); 
    };

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        calculateScale(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [width, height]); // Re-run if custom dimensions change

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Ensures the scaling logic never creates scrollbars
      }}
    >
      <div
        style={{
          width: width,
          height: height,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
          backgroundColor: '#111', // Dark background specifically for the canvas area
          overflow: 'hidden', // Prevents 3D meshes or 2D lines from bleeding outside the frame
        }}
      >
        {children}
      </div>
    </div>
  );
};