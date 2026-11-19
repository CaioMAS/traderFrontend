import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Cpu,
  Shield,
  Activity,
  RotateCcw,
  Pause,
  Play,
  Briefcase,
  History,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { useTradingFloorStore } from "../../stores/useTradingFloorStore";
import { fetchTraderDetail, fetchTraderTrades, resetTraderCapital, updateTrader } from "../../services/api";
import type { Position, Trade } from "../../types";

export const TraderDossier: React.FC = () => {
  const { selectedTraderId, setSelectedTraderId, traders } = useTradingFloorStore();
  const [detailData, setDetailData] = useState<{
    positions: Position[];
    recent_trades: Trade[];
  } | null>(null);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [totalTradeCount, setTotalTradeCount] = useState(0);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const currentTrader = traders.find((t) => t.id === selectedTraderId);

  const loadDetail = useCallback(async (traderId: string) => {
    try {
      const data = await fetchTraderDetail(traderId);
      setDetailData({
        positions: data.positions,
        recent_trades: data.recent_trades,
      });
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
    }
  }, []);

  useEffect(() => {
    if (!selectedTraderId) {
      setDetailData(null);
      setAllTrades([]);
      setShowFullHistory(false);
      return;
    }
    loadDetail(selectedTraderId);
  }, [selectedTraderId, loadDetail]);

  // Auto-refresh a cada 10 segundos quando o painel está aberto
  useEffect(() => {
    if (!selectedTraderId) return;
    const interval = setInterval(() => {
      loadDetail(selectedTraderId);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedTraderId, loadDetail]);

  const handleLoadFullHistory = async () => {
    if (!selectedTraderId) return;
    setLoadingHistory(true);
    try {
      const data = await fetchTraderTrades(selectedTraderId, 200, 0);
      setAllTrades(data.trades);
      setTotalTradeCount(data.total_count);
      setShowFullHistory(true);
    } catch (err) {
      console.error("Erro ao carregar histórico completo:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefreshHistory = async () => {
    if (!selectedTraderId) return;
    setLoadingHistory(true);
    try {
      const [detailRes, tradesRes] = await Promise.all([
        fetchTraderDetail(selectedTraderId),
        fetchTraderTrades(selectedTraderId, 200, 0),
      ]);
      setDetailData({
        positions: detailRes.positions,
        recent_trades: detailRes.recent_trades,
      });
      setAllTrades(tradesRes.trades);
      setTotalTradeCount(tradesRes.total_count);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!selectedTraderId || !currentTrader) return null;

  const totalPnl = currentTrader.realized_pnl + currentTrader.unrealized_pnl;
  const isPositive = totalPnl >= 0;

  const handleTogglePause = async () => {
    const nextStatus = currentTrader.status === "active" ? "paused" : "active";
    await updateTrader(currentTrader.id, { status: nextStatus });
  };

  const handleReset = async () => {
    if (window.confirm(`Deseja realmente resetar o saldo de ${currentTrader.name} para $200.00?`)) {
      await resetTraderCapital(currentTrader.id);
      const data = await fetchTraderDetail(currentTrader.id);
      setDetailData({
        positions: data.positions,
        recent_trades: data.recent_trades,
      });
    }
  };

  const displayTrades = showFullHistory ? allTrades : (detailData?.recent_trades || []);

  const formatTradeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-full sm:w-[480px] bg-dark-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl flex flex-col font-sans transition-all duration-300">
      {/* Cabeçalho do Dossiê */}
      <div className="p-5 border-b border-gray-800 flex items-start justify-between bg-dark-800/40">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
            style={{ backgroundColor: currentTrader.avatar_color || "#3b82f6" }}
          >
            {currentTrader.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentTrader.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                currentTrader.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {currentTrader.status === "active" ? "OPERANDO" : "PAUSADO"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
              <span>{currentTrader.trading_mode === "day_trade" ? "⚡ Day Trade" : "📈 Swing Trade"}</span>
              <span>•</span>
              <span className="capitalize">{currentTrader.personality}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedTraderId(null)}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Cartão de Rentabilidade e Patrimônio */}
        <div className="bg-dark-800/60 rounded-xl p-4 border border-gray-800 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Patrimônio Líquido</span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">
                ${currentTrader.total_equity.toFixed(2)}
              </div>
            </div>
            <div className={`text-right ${isPositive ? "text-green-400" : "text-red-400"}`}>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Resultado (P&L)</span>
              <div className="text-lg font-bold font-mono flex items-center justify-end gap-1 mt-0.5">
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}${totalPnl.toFixed(2)} ({isPositive ? "+" : ""}{currentTrader.pnl_pct.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/60 font-mono text-[11px]">
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Disponível</span>
              <span className="font-bold text-gray-200">${currentTrader.cash_balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Alocado</span>
              <span className="font-bold text-gray-200">${currentTrader.invested_capital.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] uppercase">Realizado</span>
              <span className={`font-bold ${currentTrader.realized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {currentTrader.realized_pnl >= 0 ? "+" : ""}${currentTrader.realized_pnl.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Atividade Atual e Cérebro da IA */}
        <div className="bg-dark-800/40 rounded-xl p-4 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Atividade em Tempo Real
            </span>
            <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> {currentTrader.ai_model}
            </span>
          </div>

          <div className="p-3 bg-dark-900/80 rounded-lg border border-gray-800/80 text-gray-300">
            <p className="font-medium text-[11px] text-blue-300 mb-1">
              {currentTrader.current_activity}
            </p>
            {currentTrader.last_decision_reasoning && (
              <p className="text-[10px] text-gray-400 italic leading-relaxed">
                "{currentTrader.last_decision_reasoning}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
            <span>Tokens Consumidos: <strong className="text-gray-200">{currentTrader.total_tokens_consumed.toLocaleString()}</strong></span>
            <span>Trades Executados: <strong className="text-gray-200">{currentTrader.total_trades_count}</strong></span>
          </div>
        </div>

        {/* Parâmetros de Risco e Ativos Autorizados */}
        <div className="bg-dark-800/40 rounded-xl p-4 border border-gray-800 space-y-2">
          <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Parâmetros de Estratégia
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-dark-900/60 p-2 rounded border border-gray-800 col-span-2">
              <span className="text-gray-400 text-[10px] block">Ativos Autorizados</span>
              <span className="text-emerald-400 font-bold">{currentTrader.allowed_assets || "ALL (Todos da Mesa)"}</span>
            </div>
            <div className="bg-dark-900/60 p-2 rounded border border-gray-800">
              <span className="text-gray-400 text-[10px] block">Estratégia</span>
              <span className="text-gray-200 font-bold">{currentTrader.strategy}</span>
            </div>
            <div className="bg-dark-900/60 p-2 rounded border border-gray-800">
              <span className="text-gray-400 text-[10px] block">Perfil de Risco</span>
              <span className="text-gray-200 font-bold capitalize">{currentTrader.risk_profile}</span>
            </div>
            <div className="bg-dark-900/60 p-2 rounded border border-gray-800">
              <span className="text-gray-400 text-[10px] block">Stop Loss</span>
              <span className="text-red-400 font-bold">{(currentTrader.stop_loss_pct * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-dark-900/60 p-2 rounded border border-gray-800">
              <span className="text-gray-400 text-[10px] block">Take Profit</span>
              <span className="text-green-400 font-bold">{(currentTrader.take_profit_pct * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Posições Abertas */}
        <div className="bg-dark-800/40 rounded-xl p-4 border border-gray-800 space-y-2">
          <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Posições Abertas ({detailData?.positions?.filter(p => p.status === "OPEN").length || 0})
          </span>
          
          {detailData?.positions && detailData.positions.filter(p => p.status === "OPEN").length > 0 ? (
            <div className="space-y-2">
              {detailData.positions.filter(p => p.status === "OPEN").map((pos) => {
                const posUp = pos.unrealized_pnl >= 0;
                return (
                  <div key={pos.id} className="p-2.5 bg-dark-900/80 rounded-lg border border-gray-800 font-mono text-[11px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="px-1 py-0.2 bg-blue-500/20 text-blue-400 text-[9px] rounded font-sans">LONG</span>
                        {pos.symbol}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Entrada: ${pos.entry_price.toFixed(2)} • Atual: ${pos.current_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${posUp ? "text-green-400" : "text-red-400"}`}>
                        {posUp ? "+" : ""}${pos.unrealized_pnl.toFixed(2)} ({posUp ? "+" : ""}{pos.unrealized_pnl_pct.toFixed(1)}%)
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5">
                        Alocado: ${pos.invested_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-dark-900/40 rounded-lg text-center text-gray-500 text-[11px]">
              Nenhuma posição aberta no momento. Operador monitorando oportunidades.
            </div>
          )}
        </div>

        {/* Histórico Completo de Operações */}
        <div className="bg-dark-800/40 rounded-xl p-4 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wide">
              <History className="w-3.5 h-3.5 text-gray-400" /> Histórico de Operações
              {showFullHistory && (
                <span className="text-[9px] font-normal text-gray-500 ml-1">
                  ({totalTradeCount} total)
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              {showFullHistory && (
                <button
                  onClick={handleRefreshHistory}
                  disabled={loadingHistory}
                  className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-dark-900/60 transition"
                  title="Atualizar histórico"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
                </button>
              )}
              <button
                onClick={() => {
                  if (showFullHistory) {
                    setShowFullHistory(false);
                  } else {
                    handleLoadFullHistory();
                  }
                }}
                disabled={loadingHistory}
                className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition"
              >
                {loadingHistory ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : showFullHistory ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Ver Tudo
                  </>
                )}
              </button>
            </div>
          </div>

          {displayTrades.length > 0 ? (
            <div className={`space-y-1.5 overflow-y-auto pr-1 ${showFullHistory ? "max-h-96" : "max-h-48"}`}>
              {displayTrades.map((trade) => (
                <div key={trade.id} className="p-2.5 bg-dark-900/60 rounded-lg border border-gray-800/60 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {trade.side === "BUY" ? (
                        <span className="flex items-center gap-0.5 text-blue-400 font-bold">
                          <ArrowDownRight className="w-3 h-3" /> COMPRA
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                          <ArrowUpRight className="w-3 h-3" /> VENDA
                        </span>
                      )}
                      <strong className="text-gray-200">{trade.symbol}</strong>
                      <span className="text-gray-500">@ ${trade.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.side === "SELL" && (
                        <span className={`font-bold ${trade.realized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {trade.realized_pnl >= 0 ? "+" : ""}${trade.realized_pnl.toFixed(2)}
                        </span>
                      )}
                      <span className="text-gray-500 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTradeDate(trade.executed_at)}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes expandidos no modo histórico completo */}
                  {showFullHistory && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-800/40 text-[9px] text-gray-500">
                      <div className="flex items-center justify-between mb-0.5">
                        <span>Qtd: {trade.quantity.toFixed(4)} • Valor: ${trade.total_value.toFixed(2)} • Taxa: ${trade.fee_paid.toFixed(4)}</span>
                      </div>
                      {trade.reasoning && (
                        <p className="text-gray-500 italic leading-relaxed line-clamp-2">
                          {trade.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-dark-900/40 rounded-lg text-center text-gray-500 text-[11px]">
              Histórico vazio. Nenhuma operação executada ainda.
            </div>
          )}
        </div>
      </div>

      {/* Rodapé de Ações */}
      <div className="p-4 border-t border-gray-800 bg-dark-900 flex items-center gap-2">
        <button
          onClick={handleTogglePause}
          className={`flex-1 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition ${
            currentTrader.status === "active"
              ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40"
              : "bg-green-600 hover:bg-green-500 text-white"
          }`}
        >
          {currentTrader.status === "active" ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pausar Operador
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Reativar Operador
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs flex items-center gap-1.5 transition border border-gray-700"
          title="Reiniciar carteira para $200"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset ($200)
        </button>
      </div>
    </div>
  );
};
