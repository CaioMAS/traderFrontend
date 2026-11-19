function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customApi = localStorage.getItem("trading_floor_api_url");
    if (customApi) return customApi;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Em desenvolvimento local porta 5173 aponta para 8000
  if (typeof window !== "undefined" && window.location.port === "5173") {
    return `http://${window.location.hostname}:8000/api`;
  }
  // Em produção com Nginx reverse proxy
  return "/api";
}

export const API_BASE = getApiBaseUrl();

export function getAuthToken(): string | null {
  return localStorage.getItem("trading_floor_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("trading_floor_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("trading_floor_token");
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// --- Autenticação ---
export async function loginWithPassword(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
    return true;
  }
  return false;
}

export async function checkAuthStatus(): Promise<{ authenticated: boolean; password_required: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`, {
      headers: getHeaders(),
    });
    if (!res.ok) return { authenticated: false, password_required: true };
    return res.json();
  } catch {
    return { authenticated: false, password_required: true };
  }
}

// --- Traders ---
export async function fetchTraderDetail(traderId: string) {
  const res = await fetch(`${API_BASE}/traders/${traderId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar detalhes do operador");
  return res.json();
}

export async function createTrader(payload: any) {
  const res = await fetch(`${API_BASE}/traders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao criar operador");
  return res.json();
}

export async function updateTrader(traderId: string, payload: any) {
  const res = await fetch(`${API_BASE}/traders/${traderId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao atualizar operador");
  return res.json();
}

export async function resetTraderCapital(traderId: string) {
  const res = await fetch(`${API_BASE}/traders/${traderId}/reset`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao reiniciar carteira");
  return res.json();
}

export async function deleteTrader(traderId: string) {
  const res = await fetch(`${API_BASE}/traders/${traderId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao excluir operador");
  return res.json();
}

// --- Admin ---
export async function toggleKillSwitch() {
  const res = await fetch(`${API_BASE}/admin/kill-switch/toggle`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao alternar kill switch");
  return res.json();
}

export async function pauseAllTraders() {
  const res = await fetch(`${API_BASE}/admin/pause-all`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao pausar operadores");
  return res.json();
}

export async function resumeAllTraders() {
  const res = await fetch(`${API_BASE}/admin/resume-all`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao reativar operadores");
  return res.json();
}

export async function fetchMonitoredAssets() {
  const res = await fetch(`${API_BASE}/admin/assets`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Erro ao buscar ativos monitorados");
  return res.json();
}

export async function addMonitoredAsset(symbol: string) {
  const res = await fetch(`${API_BASE}/admin/assets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ symbol }),
  });
  if (!res.ok) throw new Error("Erro ao adicionar ativo");
  return res.json();
}

export async function removeMonitoredAsset(symbol: string) {
  const res = await fetch(`${API_BASE}/admin/assets/${symbol}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao remover ativo");
  return res.json();
}
