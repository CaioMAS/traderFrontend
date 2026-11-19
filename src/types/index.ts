export interface Trader {
  id: string;
  name: string;
  role: string;
  personality: string;
  risk_profile: "low" | "medium" | "high";
  strategy: string;
  trading_mode: "day_trade" | "swing_trade";
  allowed_assets: string;
  ai_model: string;
  avatar_color: string;
  desk_index: number;
  initial_capital: number;
  cash_balance: number;
  invested_capital: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_equity: number;
  pnl_pct: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  status: "active" | "paused" | "circuit_break";
  current_activity: string;
  last_decision_reasoning: string;
  total_tokens_consumed: number;
  total_trades_count: number;
  winning_trades_count: number;
  losing_trades_count: number;
}

export interface Position {
  id: string;
  trader_id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entry_price: number;
  current_price: number;
  quantity: number;
  invested_amount: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  stop_loss_price?: number;
  take_profit_price?: number;
  status: "OPEN" | "CLOSED";
  opened_at: string;
  closed_at?: string;
}

export interface Trade {
  id: string;
  trader_id: string;
  position_id?: string;
  symbol: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  total_value: number;
  fee_paid: number;
  realized_pnl: number;
  reasoning: string;
  executed_at: string;
}

export interface StockTicker {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
  high: number;
  low: number;
}

export interface TokenGroupStats {
  consumed: number;
  limit: number;
  available: number;
  pct_used: number;
}

export interface TokenStats {
  date: string;
  group1: TokenGroupStats;
  group2: TokenGroupStats;
  total_cost_usd: number;
  by_model: Record<string, number>;
}

export interface FloorSummary {
  total_equity: number;
  total_realized_pnl: number;
  total_unrealized_pnl: number;
  active_traders_count: number;
}
