import React, { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore } from '../../store/useStudioStore';

export const SynchronizedCamera: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const workspace = useStudioStore((state) => state.workspace);

  // We expose a global method to the window so the UI panel can trigger a camera jump
  // This avoids passing complex Three.js objects into Zustand state.
  React.useEffect(() => {
    (window as any).__loadCameraView = (position: number[], target: number[], zoom: number) => {
      camera.position.set(position[0], position[1], position[2]);
      camera.zoom = zoom;
      if (controlsRef.current) {
        controlsRef.current.target.set(target[0], target[1], target[2]);
      } else {
        camera.lookAt(target[0], target[1], target[2]);
      }
      camera.updateProjectionMatrix();
    };

    (window as any).__getCurrentCameraData = () => {
      return {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: controlsRef.current ? [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z] : [0,0,0],
        zoom: camera.zoom
      };
    };
  }, [camera]);

  // OrbitControls are active ONLY in modeling mode. 
  // In painting mode, the camera naturally locks exactly where it was left.
  return workspace === 'MODELING' ? <OrbitControls ref={controlsRef} makeDefault /> : null;
};