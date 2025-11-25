"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MeshWobbleMaterial,
  Sphere,
  Torus,
  Octahedron,
  Icosahedron,
  Dodecahedron,
} from "@react-three/drei";
import type * as THREE from "three";

interface FloatingShapeProps {
  position: [number, number, number];
  scale: number;
  rotationSpeed: number;
  floatSpeed: number;
  color: string;
  geometry: "sphere" | "torus" | "octahedron" | "icosahedron" | "dodecahedron";
  movementRange?: number;
  movementSpeedX?: number;
  movementSpeedZ?: number;
}

export default function FloatingShape({
  position,
  scale,
  rotationSpeed,
  floatSpeed,
  color,
  geometry,
  movementRange = 8,
  movementSpeedX = 0.8,
  movementSpeedZ = 0.6,
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const startPosition = useRef(position);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += rotationSpeed;
    meshRef.current.rotation.y += rotationSpeed * 1.3;
    meshRef.current.rotation.z += rotationSpeed * 0.7;

    // Floating animation on Y axis
    timeRef.current += floatSpeed * 0.005;
    meshRef.current.position.y =
      startPosition.current[1] + Math.sin(timeRef.current) * 1.5;

    // Movement across X axis (horizontal - full screen width)
    meshRef.current.position.x =
      startPosition.current[0] +
      Math.sin(timeRef.current * movementSpeedX) * movementRange;

    // Movement across Z axis (depth - full screen height mapped to Z)
    meshRef.current.position.z =
      startPosition.current[2] +
      Math.cos(timeRef.current * movementSpeedZ) * movementRange * 0.8;
  });

  const shapeComponents = {
    sphere: (
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wobble={0.3}
          wireframe={false}
        />
      </Sphere>
    ),
    torus: (
      <Torus ref={meshRef} args={[1, 0.4, 32, 100]}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wobble={0.2}
          wireframe={false}
        />
      </Torus>
    ),
    octahedron: (
      <Octahedron ref={meshRef} args={[1, 0]}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wobble={0.25}
          wireframe={false}
        />
      </Octahedron>
    ),
    icosahedron: (
      <Icosahedron ref={meshRef} args={[1, 0]}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wobble={0.3}
          wireframe={false}
        />
      </Icosahedron>
    ),
    dodecahedron: (
      <Dodecahedron ref={meshRef} args={[1, 0]}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          wobble={0.2}
          wireframe={false}
        />
      </Dodecahedron>
    ),
  };

  return (
    <group position={position} scale={scale}>
      {shapeComponents[geometry]}
    </group>
  );
}
