import React, { useMemo } from "react";
import * as THREE from "three";

interface DeskStationProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  deskNumber: number;
}

export const DeskStation: React.FC<DeskStationProps> = ({
  position,
  rotation = [0, 0, 0],
  deskNumber,
}) => {
  const { chartTexture, matrixTexture } = useMemo(() => {
    // 1. Candlestick Chart Texture
    const canvas1 = document.createElement("canvas");
    canvas1.width = 256;
    canvas1.height = 160;
    const ctx1 = canvas1.getContext("2d")!;
    ctx1.fillStyle = "#090d16";
    ctx1.fillRect(0, 0, 256, 160);
    ctx1.strokeStyle = "#172338";
    ctx1.lineWidth = 1;
    for (let x = 0; x < 256; x += 32) {
      ctx1.beginPath();
      ctx1.moveTo(x, 0);
      ctx1.lineTo(x, 160);
      ctx1.stroke();
    }
    for (let y = 0; y < 160; y += 32) {
      ctx1.beginPath();
      ctx1.moveTo(0, y);
      ctx1.lineTo(256, y);
      ctx1.stroke();
    }
    let lastY = 100;
    for (let i = 10; i < 240; i += 18) {
      const up = Math.random() > 0.45;
      const h = 10 + Math.random() * 25;
      const y = Math.max(20, Math.min(130, lastY + (up ? -12 : 12)));
      lastY = y;
      ctx1.fillStyle = up ? "#22c55e" : "#ef4444";
      ctx1.strokeStyle = up ? "#22c55e" : "#ef4444";
      ctx1.beginPath();
      ctx1.moveTo(i + 6, y - 6);
      ctx1.lineTo(i + 6, y + h + 6);
      ctx1.stroke();
      ctx1.fillRect(i + 2, y, 8, h);
    }
    const tex1 = new THREE.CanvasTexture(canvas1);

    // 2. Code / Matrix Terminal Texture
    const canvas2 = document.createElement("canvas");
    canvas2.width = 256;
    canvas2.height = 160;
    const ctx2 = canvas2.getContext("2d")!;
    ctx2.fillStyle = "#05080f";
    ctx2.fillRect(0, 0, 256, 160);
    ctx2.fillStyle = "#10b981";
    ctx2.font = "10px monospace";
    const lines = [
      `>> DESK #${deskNumber} [NYSE FEED]`,
      "BID: AAPL $228.30 | VOL 14.2k",
      "ASK: NVDA $138.52 | RSI 34.2",
      "STATUS: AGENT_EXECUTING",
      "MACD: CROSSOVER_DETECTED",
      "CONFIDENCE: 88.4% [BUY]",
      "TP: +4.5% | SL: -2.0%",
      "LATENCY: 1.2ms [OK]"
    ];
    lines.forEach((line, idx) => {
      ctx2.fillText(line, 12, 22 + idx * 16);
    });
    const tex2 = new THREE.CanvasTexture(canvas2);

    return { chartTexture: tex1, matrixTexture: tex2 };
  }, [deskNumber]);

  return (
    <group position={position} rotation={rotation}>
      {/* Tampo da Mesa */}
      <mesh position={[0, 0.72, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.75]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Pés metálicos */}
      <mesh position={[-0.65, 0.36, 0.45]}>
        <boxGeometry args={[0.04, 0.72, 0.7]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, 0.36, 0.45]}>
        <boxGeometry args={[0.04, 0.72, 0.7]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Suporte dos Monitores */}
      <mesh position={[0, 0.95, 0.7]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Monitor Esquerdo */}
      <group position={[-0.32, 1.05, 0.65]} rotation={[0, 0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.55, 0.35, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[0.52, 0.32]} />
          <meshStandardMaterial
            map={chartTexture}
            emissive="#10b981"
            emissiveMap={chartTexture}
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Monitor Direito */}
      <group position={[0.32, 1.05, 0.65]} rotation={[0, -0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.55, 0.35, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[0.52, 0.32]} />
          <meshStandardMaterial
            map={matrixTexture}
            emissive="#059669"
            emissiveMap={matrixTexture}
            emissiveIntensity={0.55}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Teclado e Mouse */}
      <mesh position={[0, 0.75, 0.38]}>
        <boxGeometry args={[0.42, 0.015, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.75, 0.38]}>
        <boxGeometry args={[0.07, 0.018, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Xícara de Café */}
      <mesh position={[-0.45, 0.78, 0.35]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>

      {/* Vaso com planta */}
      <group position={[-0.55, 0.78, 0.65]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.04, 0.07, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
