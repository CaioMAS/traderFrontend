import { useTradingFloorStore } from "../stores/useTradingFloorStore";
import { getAuthToken } from "./api";

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;

  private getWsUrl(): string {
    if (typeof window !== "undefined") {
      const customWs = localStorage.getItem("trading_floor_ws_url");
      if (customWs) return customWs;
    }
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    if (typeof window !== "undefined" && window.location.port === "5173") {
      return `ws://${window.location.hostname}:8000/ws`;
    }
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const protocol = isHttps ? "wss:" : "ws:";
    const host = typeof window !== "undefined" ? window.location.host : "localhost";
    return `${protocol}//${host}/ws`;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = getAuthToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${this.getWsUrl()}${tokenQuery}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Conectado ao Trading Floor WebSocket");
        useTradingFloorStore.getState().setIsConnected(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "FLOOR_UPDATE") {
            useTradingFloorStore.getState().setFloorUpdate(data);
          }
        } catch (err) {
          console.error("Erro ao processar mensagem do WebSocket:", err);
        }
      };

      this.ws.onclose = (event) => {
        useTradingFloorStore.getState().setIsConnected(false);
        // Se foi código 1008 (não autorizado), não reconecta automaticamente
        if (event.code === 1008) {
          console.warn("WebSocket rejeitado por falta de autenticação válida.");
          return;
        }
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      console.error("Erro ao iniciar WebSocket:", e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, 2500);
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
