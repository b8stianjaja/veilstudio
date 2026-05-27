import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore } from '../../store/useStudioStore';

export const SynchronizedCamera: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  const workspace = useStudioStore((state) => state.workspace);
  const activeCamera = useStudioStore((state) => state.threeState.activeCamera);
  const saveCameraPreset = useStudioStore((state) => state.saveCameraPreset);

  // Capture camera matrix when switching out of MODELING
  useEffect(() => {
    if (workspace === 'PAINTING' && controlsRef.current) {
      const target = controlsRef.current.target;
      saveCameraPreset({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [target.x, target.y, target.z],
        fov: (camera as any).fov || 45,
        zoom: camera.zoom || 1
      });
    }
  }, [workspace, camera, saveCameraPreset]);

  // Lock camera to preset when in PAINTING mode
  useEffect(() => {
    if (workspace === 'PAINTING' && activeCamera) {
      camera.position.set(...activeCamera.position);
      (camera as any).fov = activeCamera.fov;
      camera.zoom = activeCamera.zoom;
      camera.lookAt(...activeCamera.target);
      camera.updateProjectionMatrix();
    }
  }, [workspace, activeCamera, camera]);

  return workspace === 'MODELING' ? <OrbitControls ref={controlsRef} makeDefault /> : null;
};