import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { loginWithPassword, checkAuthStatus } from "../../services/api";
import { wsService } from "../../services/websocket";

interface LoginGateModalProps {
  onAuthenticated: () => void;
}

export const LoginGateModal: React.FC<LoginGateModalProps> = ({ onAuthenticated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthStatus().then((status) => {
      if (status.authenticated) {
        setIsAuthenticated(true);
        onAuthenticated();
      } else {
        setIsAuthenticated(false);
      }
    });
  }, [onAuthenticated]);

  if (isAuthenticated === null) {
    // Verificando status silenciosamente
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const ok = await loginWithPassword(password);
      if (ok) {
        setIsAuthenticated(true);
        onAuthenticated();
        wsService.connect();
      } else {
        setErrorMsg("Senha incorreta. Verifique o valor de ACCESS_PASSWORD no .env.");
      }
    } catch {
      setErrorMsg("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070a10]/95 backdrop-blur-xl select-none font-sans">
      <div className="w-full max-w-md bg-dark-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Ícone e Título */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">TRADING FLOOR AI</h2>
          <p className="text-xs text-gray-400 font-mono">
            Acesso Restrito • Mesa de Operações Autônomas
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário de Senha */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide block mb-1.5">
              Senha de Acesso à Mesa
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Digite sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-800/80 border border-gray-700/80 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono pl-10"
                required
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1">
              Definida pela variável ACCESS_PASSWORD no servidor
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
          >
            <span>{isSubmitting ? "Autenticando..." : "Entrar na Sala de Operações"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
