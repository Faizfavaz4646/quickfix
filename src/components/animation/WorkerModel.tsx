import { OrbitControls, useAnimations, useGLTF,Text3D} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";


function LadyModelInner() {
  const { scene, animations } = useGLTF("/images/lady.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions) {
      const keys = Object.keys(actions);
      if (keys.length > 0) {
        const action = actions[keys[0]];
        if (action) {
          action.reset().fadeIn(1).play();
        }
      }
    }

    // Reset upright
    scene.rotation.set(0, 0, 0);
  }, [actions, scene]);

  return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />; // lift up a bit
}

function Toolbox() {
  return (
    <mesh position={[0,0.1, -0.7]}>
      <boxGeometry args={[3, 1, 2]} /> {/* width, height, depth */}
      <meshStandardMaterial color={"yellow"} metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function LadyOnToolbox() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 2, 8], fov: 35 }}> 
        {/* 🌎 Base ambient light */}
        <ambientLight intensity={1} />

        {/* 💡 Key light */}
        <directionalLight position={[3, 5, 5]} intensity={1.5} />

        {/* 💡 Fill light */}
        <directionalLight position={[-3, 3, 2]} intensity={1} color="lightblue" />

        {/* 💡 Back/rim light */}
        <directionalLight position={[0, 4, -5]} intensity={1} color="white" />

        {/* 🎯 Spotlight for face */}
        <spotLight
          position={[0, 6, 6]}
          angle={0.4}
          penumbra={0.5}
          intensity={1.2}
        />

        {/* Group lady + toolbox together */}
        <group scale={1.8} position={[0, -1, 0]}>
          <Toolbox />
          <LadyModelInner />
           {/* 📝 Text on the front of the cube */}
      <Text3D
      font="/fonts/Boldonse_Regular.json"
      size={0.40}
      height={0.4}
      position={[-1.7, 0.7, -1.5]} // adjust Z to be slightly in front of cube
      rotation={[0, 0, 0]} // facing forward
      bevelEnabled
      bevelThickness={0.05}
      bevelSize={0.03}
      bevelSegments={5}
    
      >
       QuickFix 
        <meshStandardMaterial color="skyblue" />
      </Text3D>
        </group>
        <OrbitControls enableZoom={false} enablePan={false} /> 
        {/* Locked orbit (only rotate if you want) */}
      </Canvas>
    </div>
  );
}

