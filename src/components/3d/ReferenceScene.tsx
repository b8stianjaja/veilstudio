import { Canvas } from '@react-three/fiber';
import { useStudioStore } from '../../store/useStudioStore';
import { SynchronizedCamera } from './SynchronizedCamera';
import { BlockoutNode } from './BlockoutNode';

export const ReferenceScene = () => {
  const { workspace, threeState, setSelectedNode } = useStudioStore();
  const isModeling = workspace === 'MODELING';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Canvas 
        id="r3f-canvas" 
        gl={{ preserveDrawingBuffer: true }}
        onPointerMissed={() => isModeling && setSelectedNode(null)} // Deselect on empty click
      >
        {/* Environment setup */}
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={threeState.ambient} />
        <directionalLight position={threeState.lightPos} castShadow />
        
        {/* Dynamic mesh rendering */}
        {threeState.nodes.map((node) => (
          <BlockoutNode key={node.id} node={node} isModeling={isModeling} />
        ))}

        <SynchronizedCamera />
        
        {/* Grid helper for spatial reference during modeling */}
        {isModeling && <gridHelper args={[100, 100, '#333', '#222']} position={[0, -2, 0]} />}
      </Canvas>
    </div>
  );
};