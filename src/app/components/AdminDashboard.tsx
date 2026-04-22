import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  LogOut, RefreshCw, Star, Users, TrendingUp, Award,
  Clock, MessageSquare, ChevronDown, ChevronUp, Search,
  BarChart2, Calendar, Filter
} from "lucide-react";
import srmLogo from "../../imports/image.png";

interface Response {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  date_service: string;
  categorie: string;
  type_service: string;
  satisfaction: number;
  qualite: number;
  professionnalisme: number;
  delais: number;
  rapport: number;
  commentaire: string;
  suggestion: string;
  created_at: string;
}

interface Stats {
  total: number;
  avg_satisfaction: number;
  avg_qualite: number;
  avg_professionnalisme: number;
  avg_delais: number;
  avg_rapport: number;
  avg_global: number;
}

interface AdminDashboardProps {
  nom: string;
  token: string;
  onLogout: () => void;
}

const AUTO_REFRESH_INTERVAL = 30000; // 30 secondes

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100`}>
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export function AdminDashboard({ nom, token, onLogout }: AdminDashboardProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "satisfaction">("date");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resData, statsData] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/responses`, { headers: authHeaders }),
        fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: authHeaders }),
      ]);
      if (!resData.ok || !statsData.ok) {
        if (resData.status === 401 || resData.status === 403) {
          toast.error("Session expirée, reconnectez-vous");
          onLogout();
          return;
        }
        throw new Error("Erreur serveur");
      }
      const [r, s] = await Promise.all([resData.json(), statsData.json()]);
      setResponses(r);
      setStats(s);
      setLastRefresh(new Date());
      
    } catch {
      if (!silent) toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Chargement initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filtrage et tri
  const filtered = responses
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        r.nom?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.type_service?.toLowerCase().includes(q);
      const matchCat = filterCategorie === "all" || r.categorie === filterCategorie;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return b.satisfaction - a.satisfaction;
    });

  const categories = [...new Set(responses.map((r) => r.categorie).filter(Boolean))];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={srmLogo} alt="SRM" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Dashboard Admin</h1>
              <p className="text-xs text-gray-400">Bienvenue, {nom}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dernière synchro */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Synchro : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <button
              onClick={() => fetchData(true)}
              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="Total réponses"
              value={stats.total}
              color="bg-blue-50"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-yellow-600" />}
              label="Note globale"
              value={`${stats.avg_global}/5`}
              color="bg-yellow-50"
            />
            <StatCard
              icon={<Star className="w-5 h-5 text-orange-500" />}
              label="Satisfaction"
              value={`${stats.avg_satisfaction}/5`}
              color="bg-orange-50"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              label="Qualité"
              value={`${stats.avg_qualite}/5`}
              color="bg-green-50"
            />
            <StatCard
              icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
              label="Professionnalisme"
              value={`${stats.avg_professionnalisme}/5`}
              color="bg-purple-50"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-cyan-600" />}
              label="Délais"
              value={`${stats.avg_delais}/5`}
              color="bg-cyan-50"
            />
          </div>
        )}

        {/* Barre de filtres */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, service..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "satisfaction")}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Trier par date</option>
                <option value="satisfaction">Trier par satisfaction</option>
              </select>
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Liste des réponses */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Aucune réponse trouvée</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                {/* Ligne principale */}
                <div
                  className="px-5 py-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  {/* Infos client */}
                  <div className="flex-1 min-w-40">
                    <p className="font-semibold text-gray-800 text-sm">{r.nom}</p>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    {r.categorie && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                        {r.categorie}
                      </span>
                    )}
                    {r.type_service && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        {r.type_service}
                      </span>
                    )}
                  </div>

                  {/* Note satisfaction */}
                  <div className="flex items-center gap-2">
                    <StarDisplay value={r.satisfaction} />
                    <span className="text-sm font-bold text-gray-700">{r.satisfaction}/5</span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-400 hidden md:block">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </p>

                  {/* Toggle */}
                  {expandedId === r.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
                  }
                </div>

                {/* Détails expandables */}
                {expandedId === r.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Infos détaillées */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Informations client</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Téléphone</p>
                            <p className="font-medium text-gray-700">{r.telephone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Date service</p>
                            <p className="font-medium text-gray-700">{r.date_service ? new Date(r.date_service).toLocaleDateString("fr-FR") : "—"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Enregistré le</p>
                            <p className="font-medium text-gray-700">{formatDate(r.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Notes détaillées */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Évaluations</h4>
                        {[
                          { label: "Satisfaction globale", value: r.satisfaction },
                          { label: "Qualité du service", value: r.qualite },
                          { label: "Professionnalisme", value: r.professionnalisme },
                          { label: "Délais", value: r.delais },
                          { label: "Rapport qualité", value: r.rapport },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{label}</span>
                            <div className="flex items-center gap-2">
                              <StarDisplay value={value} />
                              <span className="text-xs font-medium text-gray-600 w-6 text-right">{value}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commentaires */}
                    {(r.commentaire || r.suggestion) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {r.commentaire && (
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Commentaire
                            </p>
                            <p className="text-sm text-gray-700">{r.commentaire}</p>
                          </div>
                        )}
                        {r.suggestion && (
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Suggestion
                            </p>
                            <p className="text-sm text-gray-700">{r.suggestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer auto-refresh info */}
      <div className="text-center py-4 text-xs text-gray-400">
        Actualisation automatique toutes les 30 secondes
      </div>
    </div>
  );
}
