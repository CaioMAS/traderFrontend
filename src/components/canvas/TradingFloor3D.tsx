import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { OfficeScene } from "./OfficeScene";
import { DeskStation } from "./DeskStation";
import { TraderAvatar } from "./TraderAvatar";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";

export const TradingFloor3D: React.FC = () => {
  const traders = useTradingFloorStore((s) => s.traders);

  // Calcula posições das mesas organizadas em fileiras
  // Fileira 1 (Fundos): índices 0, 1, 2
  // Fileira 2 (Frente): índices 3, 4, 5...
  const getDeskCoordinates = (index: number): [number, number, number] => {
    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = (col - 1) * 2.8;
    const z = (row * 3.2) - 1.5;
    return [x, 0, z];
  };

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full bg-[#0b0f17]"
      >
        {/* Câmera Isométrica com ângulo clássico de 45° */}
        <PerspectiveCamera
          makeDefault
          position={[11, 13, 11]}
          fov={34}
          near={0.1}
          far={100}
        />

        {/* Controles suaves de órbita e zoom com limites */}
        <OrbitControls
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={32}
        />

        {/* Iluminação da Sala */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[8, 16, 10]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-6, 6, 2]} intensity={20} color="#38bdf8" decay={2} />

        <Suspense fallback={null}>
          {/* Cenário da Sala de Operações */}
          <OfficeScene />

          {/* Estações de Trabalho e Operadores */}
          {traders.map((trader, idx) => {
            const deskPos = getDeskCoordinates(trader.desk_index ?? idx);
            // Operador sentado atrás da mesa olhando para os monitores
            const avatarPos: [number, number, number] = [deskPos[0], deskPos[1], deskPos[2] + 0.1];

            return (
              <group key={trader.id || idx}>
                <DeskStation position={deskPos} deskNumber={idx + 1} />
                <TraderAvatar trader={trader} position={avatarPos} />
              </group>
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
};
