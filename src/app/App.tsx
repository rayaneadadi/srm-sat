import { useState, useEffect } from "react";
import { SatisfactionForm } from "./components/SatisfactionForm";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";

type AppState = "login" | "client" | "admin";

export default function App() {
  const [appState, setAppState] = useState<AppState>("login");
  const [token, setToken] = useState<string>("");
  const [nom, setNom] = useState<string>("");

  // Vérifier si une session existe déjà au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem("srm_token");
    const savedRole = localStorage.getItem("srm_role");
    const savedNom = localStorage.getItem("srm_nom");
    if (savedToken && savedRole && savedNom) {
      setToken(savedToken);
      setNom(savedNom);
      setAppState(savedRole === "admin" ? "admin" : "client");
    }
  }, []);

  const handleLogin = (newToken: string, role: string, userName: string) => {
    setToken(newToken);
    setNom(userName);
    setAppState(role === "admin" ? "admin" : "client");
  };

  const handleLogout = () => {
    localStorage.removeItem("srm_token");
    localStorage.removeItem("srm_role");
    localStorage.removeItem("srm_nom");
    setToken("");
    setNom("");
    setAppState("login");
  };

  return (
    <div className="min-h-screen">
      {appState === "login" && (
        <LoginPage onLogin={handleLogin} />
      )}
      {appState === "client" && (
        <div>
          {/* Bouton déconnexion pour client */}
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-white shadow-md rounded-xl text-sm text-gray-600 hover:text-red-500 hover:shadow-lg transition border border-gray-100"
            >
              <span>Déconnexion</span>
            </button>
          </div>
          <SatisfactionForm />
        </div>
      )}
      {appState === "admin" && (
        <AdminDashboard nom={nom} token={token} onLogout={handleLogout} />
      )}
      <Toaster position="top-center" />
    </div>
  );
}
