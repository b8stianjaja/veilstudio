import React, { useState, useEffect, useRef } from 'react';
import { WORKSPACE_CONFIG } from '../config/workspace';

interface ViewportFrameProps {
  children: React.ReactNode;
}

export const ViewportFrame: React.FC<ViewportFrameProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = (width: number, height: number) => {
      // Calculate how much we need to scale down the 1920x1080 box to fit the screen
      const scaleX = width / WORKSPACE_CONFIG.logicalWidth;
      const scaleY = height / WORKSPACE_CONFIG.logicalHeight;
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
  }, []);

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
          width: WORKSPACE_CONFIG.logicalWidth,
          height: WORKSPACE_CONFIG.logicalHeight,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
          backgroundColor: '#111', // Dark background specifically for the canvas area
          overflow: 'hidden', // Prevents 3D meshes or 2D lines from bleeding outside the 16:9 box
        }}
      >
        {children}
      </div>
    </div>
  );
};