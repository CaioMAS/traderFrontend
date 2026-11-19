import React, { useMemo } from "react";
import * as THREE from "three";

export const OfficeScene: React.FC = () => {
  // Gera painel com o nome e cotações da mesa
  const wallSignTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("TRADING FLOOR AI", 20, 60);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 20px monospace";
    ctx.fillText("WALL STREET STOCKS • AUTONOMOUS AGENTS", 24, 100);

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Piso da Sala de Operações */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grade sutil no piso */}
      <gridHelper args={[24, 24, "#1e293b", "#172033"]} position={[0, 0.01, 0]} />

      {/* Parede dos Fundos (Com ripas de madeira elegantes como na foto) */}
      <group position={[0, 4, -7]}>
        {/* Painel base da parede */}
        <mesh receiveShadow>
          <boxGeometry args={[20, 8, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        {/* Ripas verticais de madeira acústica */}
        {Array.from({ length: 30 }).map((_, i) => (
          <mesh key={i} position={[-7.5 + i * 0.52, 0, 0.16]}>
            <boxGeometry args={[0.22, 7.8, 0.08]} />
            <meshStandardMaterial color="#b47846" roughness={0.6} />
          </mesh>
        ))}

        {/* Letreiro Luminoso "TRADING FLOOR AI" */}
        <mesh position={[-1, 1.8, 0.25]}>
          <planeGeometry args={[6.5, 1.6]} />
          <meshBasicMaterial
            map={wallSignTexture}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Display de Cotações Global na Parede */}
        <group position={[5.5, 1.8, 0.25]}>
          <mesh>
            <boxGeometry args={[3.2, 1.2, 0.08]} />
            <meshStandardMaterial color="#0b0f17" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[3.0, 1.0]} />
            <meshBasicMaterial color="#059669" />
          </mesh>
        </group>
      </group>

      {/* Parede Lateral Esquerda (Janelas com vista externa) */}
      <group position={[-9, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Pilares da Janela */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[14, 8, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Painéis de Vidro com claridade */}
        {[-3.5, 0, 3.5].map((x, idx) => (
          <mesh key={idx} position={[x, 0.5, 0.1]}>
            <planeGeometry args={[3.0, 5.5]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.25}
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Luminárias Lineares Suspensas */}
      {[-2, 2].map((z, idx) => (
        <group key={idx} position={[0, 5.2, z]}>
          <mesh>
            <boxGeometry args={[8.5, 0.08, 0.15]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[8.4, 0.02, 0.12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight color="#f8fafc" intensity={25} distance={10} decay={2} position={[0, -0.2, 0]} />
        </group>
      ))}
    </group>
  );
};
