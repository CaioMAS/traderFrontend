import React from "react";
import { Newspaper } from "lucide-react";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";

export const NewsTicker: React.FC = () => {
  const newsBriefing = useTradingFloorStore((s) => s.newsBriefing);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-dark-900/90 backdrop-blur-md border-t border-gray-800/80 px-4 py-2 flex items-center justify-between text-xs font-mono select-none pointer-events-auto">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-sans font-bold text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 shadow-sm">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Analista de Mercado:</span>
        </div>

        <div className="truncate text-gray-300 text-[11px]">
          {newsBriefing || "Monitorando agências de notícias de Wall Street..."}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 pl-4 shrink-0 text-[10px] text-gray-400 font-sans">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        <span>Live Wire</span>
      </div>
    </div>
  );
};
