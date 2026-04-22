import { useState } from "react";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff, Shield, Users } from "lucide-react";
import srmLogo from "../../imports/image.png";

interface LoginPageProps {
  onLogin: (token: string, role: string, nom: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Identifiants incorrects");
        return;
      }
      // Stocker le token
      localStorage.setItem("srm_token", data.token);
      localStorage.setItem("srm_role", data.role);
      localStorage.setItem("srm_nom", data.nom);
      toast.success(`Bienvenue, ${data.nom} !`);
      onLogin(data.token, data.role, data.nom);
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Cercles décoratifs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full opacity-10 translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header bleu */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <img src={srmLogo} alt="SRM Logo" className="h-14 w-auto object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">SRM</h1>
            <p className="text-blue-100 text-sm mt-1">Société Régionale Multiservices</p>
          </div>

          {/* Formulaire */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Connexion</h2>
            <p className="text-sm text-gray-500 mb-6">Accédez à votre espace personnel</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identifiant
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre identifiant"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 text-gray-900"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 text-gray-900 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Indicateurs rôles */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">Client</p>
                  <p className="text-xs text-blue-500">Formulaire satisfaction</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-700">Admin</p>
                  <p className="text-xs text-green-500">Dashboard résultats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-xs mt-6">
          © 2026 SRM – Casablanca - Settat
        </p>
      </div>
    </div>
  );
}
