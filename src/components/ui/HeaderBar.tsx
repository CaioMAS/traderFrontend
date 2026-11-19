import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Settings,
  Cpu,
  Radio,
  Users,
  Lock,
} from "lucide-react";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";
import { toggleKillSwitch, clearAuthToken } from "../../services/api";

export const HeaderBar: React.FC = () => {
  const {
    tickers,
    floorSummary,
    tokenStats,
    killSwitchActive,
    isConnected,
    setIsAdminOpen,
    setIsTokenModalOpen,
  } = useTradingFloorStore();

  const handleKillSwitch = async () => {
    try {
      await toggleKillSwitch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLock = () => {
    clearAuthToken();
    window.location.reload();
  };

  const isTotalPositive = (floorSummary?.total_realized_pnl ?? 0) + (floorSummary?.total_unrealized_pnl ?? 0) >= 0;
  const totalFloorPnl = ((floorSummary?.total_realized_pnl ?? 0) + (floorSummary?.total_unrealized_pnl ?? 0));

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex flex-col pointer-events-none select-none">
      {/* Barra de Tickers de Mercado (Ações e ETFs) */}
      <div className="w-full bg-dark-900/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-1.5 flex items-center justify-between text-xs font-mono pointer-events-auto">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 text-gray-400 font-sans font-bold text-[11px] uppercase tracking-wider">
            <Radio className={`w-3 h-3 ${isConnected ? "text-green-400 animate-pulse" : "text-red-400"}`} />
            <span>Mesa de Ações:</span>
          </div>

          {Object.values(tickers).map((ticker) => {
            const isUp = ticker.change_pct >= 0;
            return (
              <div key={ticker.symbol} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold text-gray-200">{ticker.symbol}</span>
                <span className="text-gray-300">${ticker.price.toFixed(2)}</span>
                <span className={`flex items-center text-[10px] ${isUp ? "text-green-400" : "text-red-400"}`}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                  {isUp ? "+" : ""}{ticker.change_pct.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Status de Conexão */}
        <div className="flex items-center gap-2 pl-4">
          <span className="text-[10px] text-gray-400 font-sans">
            {isConnected ? "Conectado (Tempo Real)" : "Reconectando..."}
          </span>
        </div>
      </div>

      {/* Barra de Controles e Resumo Global */}
      <div className="w-full px-6 py-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-dark-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-800 shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            TF
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">TRADING FLOOR AI</h1>
            <p className="text-[10px] text-gray-400 font-mono">Mesa de Operações Autônomas • Ações</p>
          </div>
        </div>

        {/* Resumo Financeiro da Mesa */}
        <div className="hidden md:flex items-center gap-4 bg-dark-900/80 backdrop-blur-md px-5 py-2 rounded-xl border border-gray-800 shadow-xl font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] font-sans text-gray-400 uppercase">Patrimônio da Mesa</span>
            <span className="text-sm font-bold text-white">${floorSummary?.total_equity?.toFixed(2) || "600.00"}</span>
          </div>
          <div className="h-6 w-px bg-gray-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-sans text-gray-400 uppercase">P&L Acumulado</span>
            <span className={`text-sm font-bold ${isTotalPositive ? "text-green-400" : "text-red-400"}`}>
              {isTotalPositive ? "+" : ""}${totalFloorPnl.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-sans text-gray-400 uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-400" /> Operadores
            </span>
            <span className="text-sm font-bold text-blue-400">{floorSummary?.active_traders_count ?? 6} Ativos</span>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="flex items-center gap-2 bg-dark-900/80 hover:bg-dark-800/90 text-gray-200 border border-gray-700/80 px-3.5 py-2 rounded-xl text-xs font-mono transition shadow-lg"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">OpenAI Tokens:</span>
            <span className="text-purple-400 font-bold">
              {tokenStats?.group2?.pct_used ? `${tokenStats.group2.pct_used}%` : "0%"}
            </span>
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 bg-dark-900/80 hover:bg-dark-800 text-gray-200 border border-gray-700/80 px-3 py-2 rounded-xl text-xs font-medium transition shadow-lg"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={handleKillSwitch}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              killSwitchActive
                ? "bg-red-600 text-white animate-pulse shadow-red-500/50"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{killSwitchActive ? "KILL SWITCH ATIVO" : "KILL SWITCH"}</span>
          </button>

          <button
            onClick={handleLock}
            title="Bloquear Sala / Sair"
            className="p-2 bg-dark-900/80 hover:bg-dark-800 text-gray-400 hover:text-white border border-gray-700/80 rounded-xl transition"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
