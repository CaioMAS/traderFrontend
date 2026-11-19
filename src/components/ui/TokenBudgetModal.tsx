import React from "react";
import { X, Cpu, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";

export const TokenBudgetModal: React.FC = () => {
  const { isTokenModalOpen, setIsTokenModalOpen, tokenStats } = useTradingFloorStore();

  if (!isTokenModalOpen) return null;

  const g1 = tokenStats?.group1 || { consumed: 0, limit: 225000, available: 225000, pct_used: 0 };
  const g2 = tokenStats?.group2 || { consumed: 0, limit: 2250000, available: 2250000, pct_used: 0 };
  const cost = tokenStats?.total_cost_usd || 0.0;
  const byModel = tokenStats?.by_model || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-dark-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-dark-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Governança Centralizada de Tokens OpenAI</h3>
              <p className="text-[11px] text-gray-400 font-mono">Controle estrito de tetos diários e custos</p>
            </div>
          </div>
          <button
            onClick={() => setIsTokenModalOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5 text-xs">
          {/* Custo Total Estimado */}
          <div className="p-3.5 bg-purple-950/20 rounded-xl border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-300 font-mono uppercase block">Custo Financeiro Estimado (Hoje)</span>
              <span className="text-xl font-bold font-mono text-purple-200">${cost.toFixed(4)} USD</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Circuit Breaker Ativo
            </div>
          </div>

          {/* Grupo 1: Limite Diário de 250k (Teto interno: 225k) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-gray-200">Grupo 1 (gpt-4o, o1, o3, etc.)</span>
              <span className="text-purple-400 font-bold">{g1.consumed.toLocaleString()} / {g1.limit.toLocaleString()} ({g1.pct_used}%)</span>
            </div>
            <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden border border-gray-800">
              <div
                className={`h-full transition-all duration-500 ${
                  g1.pct_used > 80 ? "bg-red-500" : g1.pct_used > 50 ? "bg-yellow-500" : "bg-purple-500"
                }`}
                style={{ width: `${Math.min(100, g1.pct_used)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>Disponível: {g1.available.toLocaleString()} tokens</span>
              <span>Teto com 10% de margem de proteção</span>
            </div>
          </div>

          {/* Grupo 2: Limite Diário de 2.5M (Teto interno: 2.25M) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-gray-200">Grupo 2 (gpt-4o-mini, o3-mini, etc.)</span>
              <span className="text-blue-400 font-bold">{g2.consumed.toLocaleString()} / {g2.limit.toLocaleString()} ({g2.pct_used}%)</span>
            </div>
            <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden border border-gray-800">
              <div
                className={`h-full transition-all duration-500 ${
                  g2.pct_used > 80 ? "bg-red-500" : g2.pct_used > 50 ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(100, g2.pct_used)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>Disponível: {g2.available.toLocaleString()} tokens</span>
              <span>Modelos econômicos recomendados para alta frequência</span>
            </div>
          </div>

          {/* Consumo por Modelo */}
          <div className="p-3 bg-dark-800/50 rounded-xl border border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-2 font-mono">
              Distribuição por Modelo
            </span>
            {Object.keys(byModel).length > 0 ? (
              <div className="space-y-1 font-mono text-[11px]">
                {Object.entries(byModel).map(([model, count]) => (
                  <div key={model} className="flex justify-between text-gray-300">
                    <span>{model}</span>
                    <span className="font-bold text-gray-100">{count.toLocaleString()} tokens</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-500 italic">
                Nenhum token da OpenAI consumido nesta sessão (ou operando em modo heurístico quantitativo).
              </p>
            )}
          </div>

          {/* Proteção Automática */}
          <div className="flex items-start gap-2 text-[10px] text-gray-400 bg-gray-800/40 p-3 rounded-lg border border-gray-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Ao atingir 90% da cota do Grupo 1, o sistema automaticamente degrada para o modelo econômico do Grupo 2. Se o Grupo 2 atingir 95%, as decisões migram para análise matemática pura sem gastar tokens.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-dark-800/30 flex justify-end">
          <button
            onClick={() => setIsTokenModalOpen(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
