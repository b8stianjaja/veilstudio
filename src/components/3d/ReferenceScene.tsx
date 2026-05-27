import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useStudioStore } from '../../store/useStudioStore';
import { SynchronizedCamera } from './SynchronizedCamera';
import { BlockoutNode } from './BlockoutNode';

export const ReferenceScene = () => {
  const { workspace, threeState, setSelectedNode, canvasSettings } = useStudioStore();
  const isModeling = workspace === 'MODELING';
  const { lights, nodes } = threeState;

  return (
    <div style={{ position: 'absolute', width: canvasSettings.width, height: canvasSettings.height, zIndex: 1 }}>
      <Canvas 
        id="r3f-canvas" 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        resize={{ offsetSize: true }}
        onPointerMissed={() => isModeling && setSelectedNode(null)}
      >
        {/* CRITICAL FIX: Removed the rigid position bindings. 
            The camera initializes here, but is controlled entirely by OrbitControls. */}
        <OrthographicCamera makeDefault position={[0, 0, 50]} zoom={50} near={-2000} far={2000} />

        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
        <directionalLight position={lights.dirPosition} intensity={lights.dirIntensity} color={lights.dirColor} castShadow />
        
        {nodes.map((node) => (
          <BlockoutNode key={node.id} node={node} isModeling={isModeling} />
        ))}

        <SynchronizedCamera />
        
        {isModeling && <gridHelper args={[100, 100, '#333', '#222']} position={[0, -0.01, 0]} />}
      </Canvas>
    </div>
  );
};