// src/components/3d/SynchronizedCamera.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore } from '../../store/useStudioStore';

export const SynchronizedCamera: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { workspace, threeState, clearCameraTrigger } = useStudioStore();
  
  const { cameraLoadTrigger } = threeState;

  // React-safe state injection (Replaces the window hack)
  useEffect(() => {
    if (cameraLoadTrigger) {
      camera.position.set(...cameraLoadTrigger.position);
      camera.zoom = cameraLoadTrigger.zoom;
      
      if (controlsRef.current) {
        controlsRef.current.target.set(...cameraLoadTrigger.target);
        controlsRef.current.update();
      } else {
        camera.lookAt(...cameraLoadTrigger.target);
      }
      
      camera.updateProjectionMatrix();
      clearCameraTrigger(); // Reset trigger after execution
    }
  }, [cameraLoadTrigger, camera, clearCameraTrigger]);

  // Expose an internal callback strictly for saving data, avoiding global scope
  const getCurrentCameraData = useCallback(() => {
    return {
      position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
      target: controlsRef.current 
        ? [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z] as [number, number, number]
        : [0,0,0] as [number, number, number],
      zoom: camera.zoom
    };
  }, [camera]);

  // Bind the save method to a custom DOM event so the UI can request it cleanly
  useEffect(() => {
    const handleCameraRequest = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.callback === 'function') {
        e.detail.callback(getCurrentCameraData());
      }
    };
    window.addEventListener('REQUEST_CAMERA_DATA', handleCameraRequest as EventListener);
    return () => window.removeEventListener('REQUEST_CAMERA_DATA', handleCameraRequest as EventListener);
  }, [getCurrentCameraData]);

  return workspace === 'MODELING' ? <OrbitControls ref={controlsRef} makeDefault /> : null;
};