import React, { useState } from "react";
import {
  X,
  UserPlus,
  Pause,
  Play,
  ShieldAlert,
  Trash2,
  RotateCcw,
  Sliders,
  Plus,
  Layers,
} from "lucide-react";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";
import {
  createTrader,
  pauseAllTraders,
  resumeAllTraders,
  toggleKillSwitch,
  deleteTrader,
  resetTraderCapital,
  addMonitoredAsset,
  removeMonitoredAsset,
} from "../../services/api";

export const AdminModal: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, traders, tickers, killSwitchActive } = useTradingFloorStore();

  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("Agressivo & Focado");
  const [riskProfile, setRiskProfile] = useState<"low" | "medium" | "high">("medium");
  const [strategy, setStrategy] = useState("EMA Breakout & Volume");
  const [tradingMode, setTradingMode] = useState<"day_trade" | "swing_trade">("day_trade");
  const [allowedAssets, setAllowedAssets] = useState("ALL");
  const [aiModel, setAiModel] = useState("gpt-4o-mini");
  const [avatarColor, setAvatarColor] = useState("#3b82f6");
  const [stopLossPct, setStopLossPct] = useState(0.02);
  const [takeProfitPct, setTakeProfitPct] = useState(0.04);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novo ativo para a mesa
  const [newAssetSymbol, setNewAssetSymbol] = useState("");
  const [isAddingAsset, setIsAddingAsset] = useState(false);

  if (!isAdminOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createTrader({
        name,
        personality,
        risk_profile: riskProfile,
        strategy,
        trading_mode: tradingMode,
        allowed_assets: allowedAssets.trim() || "ALL",
        ai_model: aiModel,
        avatar_color: avatarColor,
        desk_index: traders.length,
        initial_capital: 200.0,
        stop_loss_pct: stopLossPct,
        take_profit_pct: takeProfitPct,
        analysis_frequency_seconds: tradingMode === "day_trade" ? 30 : 60,
      });
      setName("");
      alert("Novo operador contratado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar operador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newAssetSymbol.trim().toUpperCase();
    if (!sym) return;
    setIsAddingAsset(true);
    try {
      await addMonitoredAsset(sym);
      setNewAssetSymbol("");
    } catch (err) {
      console.error("Erro ao adicionar ativo:", err);
      alert(`Erro ao adicionar ${sym}.`);
    } finally {
      setIsAddingAsset(false);
    }
  };

  const handleRemoveAsset = async (sym: string) => {
    if (confirm(`Remover a ação ${sym} do monitoramento global?`)) {
      try {
        await removeMonitoredAsset(sym);
      } catch (err) {
        console.error("Erro ao remover ativo:", err);
      }
    }
  };

  const handleKillSwitch = async () => {
    await toggleKillSwitch();
  };

  const handlePauseAll = async () => {
    await pauseAllTraders();
  };

  const handleResumeAll = async () => {
    await resumeAllTraders();
  };

  const activeSymbols = Object.keys(tickers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl max-h-[90vh] bg-dark-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans">
        {/* Topo */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-dark-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Painel Administrativo da Sala</h3>
              <p className="text-[11px] text-gray-400 font-mono">Gestão de ações do mundo, operadores e limites de risco</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Seção 1: Gestão de Ações Monitoradas no Mundo */}
          <div className="p-4 bg-dark-800/50 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                <Layers className="w-4 h-4 text-emerald-400" /> Ações e ETFs Monitorados na Mesa ({activeSymbols.length})
              </span>
              <span className="text-[10px] text-gray-400 font-mono">NYSE • NASDAQ • B3 • S&P 500</span>
            </div>

            {/* Badges de Ativos Ativos */}
            <div className="flex flex-wrap gap-2 pt-1">
              {activeSymbols.map((sym) => (
                <div
                  key={sym}
                  className="px-2.5 py-1 bg-dark-900 border border-gray-700/80 rounded-lg flex items-center gap-2 font-mono text-xs text-gray-200 shadow-sm"
                >
                  <span className="font-bold">{sym}</span>
                  <button
                    onClick={() => handleRemoveAsset(sym)}
                    className="text-gray-400 hover:text-red-400 transition"
                    title={`Remover ${sym}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Form para Adicionar QUALQUER Ação do Mundo */}
            <form onSubmit={handleAddAsset} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Digitar ticker (ex: META, GOOGL, AMD, NFLX, PLTR, PETR4.SA, VALE3.SA)..."
                value={newAssetSymbol}
                onChange={(e) => setNewAssetSymbol(e.target.value)}
                className="flex-1 bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 font-mono text-xs uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isAddingAsset}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" /> {isAddingAsset ? "Buscando..." : "Adicionar Ação"}
              </button>
            </form>
          </div>

          {/* Seção 2: Comandos Mestres da Mesa */}
          <div className="p-4 bg-dark-800/50 rounded-xl border border-gray-800 space-y-3">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide block font-mono">
              Comandos Mestres da Mesa
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePauseAll}
                className="px-3.5 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl font-medium flex items-center gap-2 transition"
              >
                <Pause className="w-4 h-4" /> Pausar Todos os Operadores
              </button>
              <button
                onClick={handleResumeAll}
                className="px-3.5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl font-medium flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4" /> Reativar Todos
              </button>
              <button
                onClick={handleKillSwitch}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
                  killSwitchActive
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                {killSwitchActive ? "DESATIVAR KILL SWITCH" : "ACIONAR KILL SWITCH"}
              </button>
            </div>
          </div>

          {/* Seção 3: Formulário Contratar Novo Operador */}
          <form onSubmit={handleCreate} className="p-4 bg-dark-800/40 rounded-xl border border-gray-800 space-y-4">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide flex items-center gap-2 font-mono">
              <UserPlus className="w-4 h-4 text-blue-400" /> Contratar Novo Operador de IA (Capital Inicial: $200)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nome do Operador</label>
                <input
                  type="text"
                  placeholder="ex: Thiago Ramos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Modalidade</label>
                <select
                  value={tradingMode}
                  onChange={(e: any) => setTradingMode(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="day_trade">⚡ Day Trade (Intraday)</option>
                  <option value="swing_trade">📈 Swing Trade (Médio Prazo)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Ativos Autorizados</label>
                <input
                  type="text"
                  placeholder="ALL ou ex: NVDA, AAPL, META"
                  value={allowedAssets}
                  onChange={(e) => setAllowedAssets(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  title="Digite ALL para operar qualquer ação ou separe os tickers por vírgula"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Modelo de IA</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Econômico - Grupo 2)</option>
                  <option value="gpt-4o">gpt-4o (Avançado - Grupo 1)</option>
                  <option value="o3-mini">o3-mini (Raciocínio - Grupo 2)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Personalidade</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Estratégia</label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Perfil de Risco</label>
                <select
                  value={riskProfile}
                  onChange={(e: any) => setRiskProfile(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Conservador (Baixo Risco)</option>
                  <option value="medium">Moderado</option>
                  <option value="high">Agressivo</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Stop Loss ({Math.round(stopLossPct * 100)}%)</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.05"
                  step="0.005"
                  value={stopLossPct}
                  onChange={(e) => setStopLossPct(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Take Profit ({Math.round(takeProfitPct * 100)}%)</label>
                <input
                  type="range"
                  min="0.02"
                  max="0.10"
                  step="0.005"
                  value={takeProfitPct}
                  onChange={(e) => setTakeProfitPct(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Cor do Avatar</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={avatarColor}
                    onChange={(e) => setAvatarColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-gray-300">{avatarColor}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? "Cadastrando..." : "Contratar Operador ($200)"}
              </button>
            </div>
          </form>

          {/* Seção 4: Lista e Gestão dos Operadores Existentes */}
          <div className="p-4 bg-dark-800/40 rounded-xl border border-gray-800 space-y-3">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wide block font-mono">
              Operadores em Atividade ({traders.length})
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-[10px] uppercase">
                    <th className="pb-2">Operador</th>
                    <th className="pb-2">Modalidade</th>
                    <th className="pb-2">Ativos Autorizados</th>
                    <th className="pb-2">Patrimônio</th>
                    <th className="pb-2">P&L</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {traders.map((t) => {
                    const pnl = t.realized_pnl + t.unrealized_pnl;
                    return (
                      <tr key={t.id} className="hover:bg-dark-800/60 transition">
                        <td className="py-2.5 font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.avatar_color }} />
                          {t.name}
                        </td>
                        <td className="py-2.5 text-gray-300">
                          {t.trading_mode === "day_trade" ? "Day Trade" : "Swing Trade"}
                        </td>
                        <td className="py-2.5 text-gray-300">
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px]">
                            {t.allowed_assets || "ALL"}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-200">${t.total_equity.toFixed(2)}</td>
                        <td className={`py-2.5 font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            t.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right space-x-2">
                          <button
                            onClick={() => resetTraderCapital(t.id)}
                            title="Resetar saldo para $200"
                            className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir operador ${t.name}?`)) deleteTrader(t.id);
                            }}
                            title="Excluir operador"
                            className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
