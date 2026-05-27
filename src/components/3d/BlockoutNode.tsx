import { useRef } from 'react';
import { TransformControls, Edges } from '@react-three/drei';
import { useStudioStore, type SceneNode } from '../../store/useStudioStore';

interface BlockoutNodeProps {
  node: SceneNode;
  isModeling: boolean;
}

export const BlockoutNode = ({ node, isModeling }: BlockoutNodeProps) => {
  const meshRef = useRef<any>(null);
  const selectedNodeId = useStudioStore((state) => state.threeState.selectedNodeId);
  const { updateNode, setSelectedNode } = useStudioStore();

  const isSelected = selectedNodeId === node.id && isModeling;

  const handleTransformChange = () => {
    if (meshRef.current) {
      updateNode(node.id, {
        position: [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z],
        rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
        scale: [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z],
      });
    }
  };

  // Factory for expanded mesh types
  const renderGeometry = () => {
    switch (node.type) {
      case 'cube': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 16]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'plane': return <planeGeometry args={[1, 1]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <>
      {isSelected && meshRef.current && (
        <TransformControls object={meshRef.current} mode="translate" onMouseUp={handleTransformChange} />
      )}
      
      <mesh
        ref={meshRef}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
        onClick={(e) => {
          if (isModeling) {
            e.stopPropagation();
            setSelectedNode(node.id);
          }
        }}
      >
        {renderGeometry()}
        {/* ADDED: Dynamic Mesh Colorization */}
        <meshStandardMaterial color={isSelected ? "#66aaff" : node.color} wireframe={!isModeling} roughness={0.7} metalness={0.2} />
        {isModeling && <Edges scale={1.05} threshold={15} color={isSelected ? "cyan" : "black"} />}
      </mesh>
    </>
  );
};