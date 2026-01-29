"use client"

import { OrbitControls, useAnimations, useGLTF, Text3D } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { MeshStandardMaterial } from "three";

function LadyModelInner() {
  const { scene, animations } = useGLTF("/images/lady.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions) {
      const keys = Object.keys(actions);
      if (keys.length > 0) {
        const action = actions[keys[0]];
        if (action) action.reset().fadeIn(1).play();
      }
    }
    scene.rotation.set(0, 0, 0);
  }, [actions, scene]);

  return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />;
}

function Toolbox() {
  return (
    <mesh position={[0, 0.1, -0.7]}>
      <boxGeometry args={[3, 1, 2]} />
      <meshStandardMaterial color="yellow" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function LadyOnToolbox() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 2, 8], fov: 35 }}>
        {/* Lights */}
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, 3, 2]} intensity={1} color="lightblue" />
        <directionalLight position={[0, 4, -5]} intensity={1} color="white" />
        <spotLight position={[0, 6, 6]} angle={0.4} penumbra={0.5} intensity={1.2} />

        {/* Group: Lady + Toolbox + Text */}
        <group scale={1.8} position={[0, -1, 0]}>
          <Toolbox />
          <LadyModelInner />

          {/* 3D Text */}
          <Text3D
            font="/fonts/Boldonse_Regular.json"
            size={0.4}
            height={0.2}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            position={[-1.7, 0.7, -1.5]}
            rotation={[0, 0, 0]}
          >
            QuickFix
            <meshStandardMaterial color="skyblue" />
          </Text3D>
        </group>

        {/* Orbit Controls */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
