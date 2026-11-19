import React, { useState } from "react";
import { TradingFloor3D } from "./components/canvas/TradingFloor3D";
import { HeaderBar } from "./components/ui/HeaderBar";
import { TraderDossier } from "./components/ui/TraderDossier";
import { AdminModal } from "./components/ui/AdminModal";
import { TokenBudgetModal } from "./components/ui/TokenBudgetModal";
import { NewsTicker } from "./components/ui/NewsTicker";
import { LoginGateModal } from "./components/ui/LoginGateModal";
import { wsService } from "./services/websocket";

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    wsService.connect();
  };

  return (
    <main className="w-screen h-screen relative bg-dark-900 overflow-hidden font-sans">
      {/* Modal de Autenticação / Senha Web */}
      <LoginGateModal onAuthenticated={handleAuthenticated} />

      {/* Interface Principal da Mesa (Renderizada quando autenticado) */}
      {isAuthenticated && (
        <>
          <HeaderBar />
          <div className="w-full h-full">
            <TradingFloor3D />
          </div>
          <TraderDossier />
          <AdminModal />
          <TokenBudgetModal />
          <NewsTicker />
        </>
      )}
    </main>
  );
};

export default App;
