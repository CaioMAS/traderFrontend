import React from "react";
import { Html } from "@react-three/drei";
import type { Trader } from "../../types";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";

interface FloatingBadgeProps {
  trader: Trader;
  position?: [number, number, number];
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({ trader, position = [0, 1.9, 0] }) => {
  const setSelectedTraderId = useTradingFloorStore((s) => s.setSelectedTraderId);
  const selectedTraderId = useTradingFloorStore((s) => s.selectedTraderId);

  const isSelected = selectedTraderId === trader.id;
  const totalPnl = trader.realized_pnl + trader.unrealized_pnl;
  const isPositive = totalPnl >= 0;
  
  const formattedPnl = `${isPositive ? "+" : ""}$${totalPnl.toFixed(2)}`;

  return (
    <Html
      position={position}
      center
      distanceFactor={11}
      zIndexRange={[100, 0]}
      className="pointer-events-auto select-none"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTraderId(trader.id);
        }}
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-tight shadow-lg transition-all duration-200 cursor-pointer ${
          isSelected
            ? "scale-110 ring-2 ring-blue-400 bg-dark-900/95"
            : "hover:scale-105 bg-dark-900/90"
        } ${
          isPositive
            ? "border border-green-500/80 text-green-400 shadow-green-500/20"
            : "border border-red-500/80 text-red-400 shadow-red-500/20"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            trader.status === "active"
              ? "bg-green-400 animate-pulse"
              : "bg-yellow-400"
          }`}
        />
        
        <span className="drop-shadow-sm">{formattedPnl}</span>

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 text-[10px] text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 whitespace-nowrap pointer-events-none">
          {trader.name.split(" ")[0]} ({trader.trading_mode === "day_trade" ? "DT" : "ST"})
        </div>
      </div>
    </Html>
  );
};
