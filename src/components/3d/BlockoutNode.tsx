import { useRef } from 'react'; // Removed the unused useEffect import
import { TransformControls, Edges } from '@react-three/drei';
import { useStudioStore, type SceneNode } from '../../store/useStudioStore';

interface BlockoutNodeProps {
  node: SceneNode;
  isModeling: boolean;
}

export const BlockoutNode = ({ node, isModeling }: BlockoutNodeProps) => {
  const meshRef = useRef<any>(null);
  const selectedNodeId = useStudioStore((state) => state.threeState.selectedNodeId);
  const setSelectedNode = useStudioStore((state) => state.setSelectedNode);
  const updateNode = useStudioStore((state) => state.updateNode);

  const isSelected = selectedNodeId === node.id && isModeling;

  // Sync transform changes back to Zustand on drag end
  const handleTransformChange = () => {
    if (meshRef.current) {
      updateNode(node.id, {
        position: [meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z],
        rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
        scale: [meshRef.current.scale.x, meshRef.current.scale.y, meshRef.current.scale.z],
      });
    }
  };

  const MeshGeometry = () => (
    <mesh
      ref={meshRef}
      position={node.position}
      rotation={node.rotation}
      scale={node.scale}
      onClick={(e) => {
        if (isModeling) {
          e.stopPropagation(); // Prevent click from bubbling to scene background
          setSelectedNode(node.id);
        }
      }}
    >
      {node.type === 'cube' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[0.5, 32, 16]} />}
      <meshStandardMaterial color={isSelected ? "#66aaff" : "#555"} wireframe={!isModeling} />
      
      {/* Add subtle outlines for better visibility against backgrounds */}
      {isModeling && <Edges scale={1.05} threshold={15} color={isSelected ? "cyan" : "black"} />}
    </mesh>
  );

  if (isSelected) {
    return (
      <TransformControls 
        mode="translate"
        onMouseUp={handleTransformChange}
      >
        <MeshGeometry />
      </TransformControls>
    );
  }

  return <MeshGeometry />;
};