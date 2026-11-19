import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Trader } from "../../types";
import { FloatingBadge } from "./FloatingBadge";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";

interface TraderAvatarProps {
  trader: Trader;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const TraderAvatar: React.FC<TraderAvatarProps> = ({
  trader,
  position,
  rotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const setSelectedTraderId = useTradingFloorStore((s) => s.setSelectedTraderId);
  const selectedTraderId = useTradingFloorStore((s) => s.selectedTraderId);
  const isSelected = selectedTraderId === trader.id;

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + trader.desk_index;
    if (headRef.current && trader.status === "active") {
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
      headRef.current.rotation.x = -0.15 + Math.cos(t * 2) * 0.03;
    }
    if (leftArmRef.current && rightArmRef.current && trader.status === "active") {
      leftArmRef.current.rotation.x = -0.8 + Math.sin(t * 8) * 0.08;
      rightArmRef.current.rotation.x = -0.8 + Math.cos(t * 8) * 0.08;
    }
  });

  const shirtColor = trader.avatar_color || "#3b82f6";

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedTraderId(trader.id);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <FloatingBadge trader={trader} position={[0, 1.85, 0]} />

      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Cadeira de Escritório */}
      <group position={[0, 0.45, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.08, 0.42]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.35, -0.2]}>
          <boxGeometry args={[0.38, 0.6, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.04, 5]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Corpo do Personagem Low-Poly */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[0, 0.1, 0.1]}>
          <boxGeometry args={[0.3, 0.12, 0.35]} />
          <meshStandardMaterial color="#18181b" />
        </mesh>

        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.36, 0.45, 0.22]} />
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </mesh>

        <mesh position={[0, 0.42, 0.12]}>
          <boxGeometry args={[0.06, 0.32, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>

        <mesh ref={leftArmRef} position={[-0.24, 0.45, 0.08]} rotation={[-0.8, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        <mesh ref={rightArmRef} position={[0.24, 0.45, 0.08]} rotation={[-0.8, -0.2, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.08]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        <mesh ref={headRef} position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>

        <mesh position={[0, 0.88, -0.03]}>
          <boxGeometry args={[0.26, 0.15, 0.26]} />
          <meshStandardMaterial color="#3f2e21" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
