"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import FloatingShape from "./floating";

export default function AnimatedBackground() {
  return (
    <Canvas
      className="w-full h-screen absolute inset-0"
      style={{
        background: "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[0, 10, -10]} intensity={0.8} color="#ec4899" />

      {/* Environment */}
      <Environment preset="night" />

      <FloatingShape
        position={[-5, 3, -2]}
        scale={1.5}
        rotationSpeed={0.003}
        floatSpeed={1.5}
        color="#6366f1"
        geometry="sphere"
        movementRange={10}
        movementSpeedX={0.8}
        movementSpeedZ={0.5}
      />
      <FloatingShape
        position={[5, -3, 1]}
        scale={1.2}
        rotationSpeed={0.004}
        floatSpeed={1.8}
        color="#ec4899"
        geometry="torus"
        movementRange={12}
        movementSpeedX={1}
        movementSpeedZ={0.7}
      />
      <FloatingShape
        position={[0, 4, -3]}
        scale={1}
        rotationSpeed={0.002}
        floatSpeed={1.2}
        color="#3b82f6"
        geometry="octahedron"
        movementRange={9}
        movementSpeedX={0.6}
        movementSpeedZ={0.8}
      />
      <FloatingShape
        position={[-6, -4, 2]}
        scale={1.3}
        rotationSpeed={0.0035}
        floatSpeed={1.6}
        color="#8b5cf6"
        geometry="icosahedron"
        movementRange={11}
        movementSpeedX={0.9}
        movementSpeedZ={0.6}
      />
      <FloatingShape
        position={[6, 2, -1]}
        scale={0.8}
        rotationSpeed={0.005}
        floatSpeed={2}
        color="#f43f5e"
        geometry="dodecahedron"
        movementRange={8}
        movementSpeedX={1.1}
        movementSpeedZ={0.5}
      />
    </Canvas>
  );
}
