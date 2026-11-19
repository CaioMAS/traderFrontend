import { create } from "zustand";
import type { Trader, StockTicker, TokenStats, FloorSummary } from "../types";

interface TradingFloorState {
  isConnected: boolean;
  killSwitchActive: boolean;
  traders: Trader[];
  tickers: Record<string, StockTicker>;
  tokenStats: TokenStats | null;
  newsBriefing: string;
  floorSummary: FloorSummary;

  selectedTraderId: string | null;
  isAdminOpen: boolean;
  isTokenModalOpen: boolean;

  setSelectedTraderId: (id: string | null) => void;
  setIsAdminOpen: (open: boolean) => void;
  setIsTokenModalOpen: (open: boolean) => void;
  setFloorUpdate: (data: any) => void;
  setIsConnected: (connected: boolean) => void;
}

export const useTradingFloorStore = create<TradingFloorState>((set) => ({
  isConnected: false,
  killSwitchActive: false,
  traders: [],
  tickers: {},
  tokenStats: null,
  newsBriefing: "Iniciando inteligência de mercado...",
  floorSummary: {
    total_equity: 1200.0,
    total_realized_pnl: 0.0,
    total_unrealized_pnl: 0.0,
    active_traders_count: 6,
  },
  selectedTraderId: null,
  isAdminOpen: false,
  isTokenModalOpen: false,

  setSelectedTraderId: (id) => set({ selectedTraderId: id }),
  setIsAdminOpen: (open) => set({ isAdminOpen: open }),
  setIsTokenModalOpen: (open) => set({ isTokenModalOpen: open }),
  
  setFloorUpdate: (data) =>
    set({
      killSwitchActive: data.kill_switch_active,
      traders: data.traders || [],
      tickers: data.tickers || {},
      tokenStats: data.token_stats || null,
      newsBriefing: data.news_briefing || "",
      floorSummary: data.floor_summary || {
        total_equity: 1200.0,
        total_realized_pnl: 0,
        total_unrealized_pnl: 0,
        active_traders_count: 0,
      },
    }),

  setIsConnected: (connected) => set({ isConnected: connected }),
}));
