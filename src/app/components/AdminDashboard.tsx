import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import { LogOut, Search, FileText, TrendingUp, Users, CheckCircle, XCircle, Clock, Eye, Upload, Download } from "lucide-react";

interface Candidature {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  licence: string;
  typeDiplome: string;
  typeBac: string;
  anneeBac: string;
  noteS1: string;
  noteS2: string;
  noteS3: string;
  noteS4: string;
  statut: "en attente" | "accepté" | "refusé";
  dateCreation: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBac, setFilterBac] = useState("tous");
  const [filterDiplome, setFilterDiplome] = useState("tous");
  const [filterLicence, setFilterLicence] = useState("tous");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);

  useEffect(() => {
    loadCandidatures();
  }, []);

  const loadCandidatures = () => {
    const data = JSON.parse(localStorage.getItem("candidatures") || "[]");
    setCandidatures(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast.success("Déconnexion réussie");
    onLogout();
  };

  const updateStatut = (id: string, newStatut: "en attente" | "accepté" | "refusé") => {
    const updatedCandidatures = candidatures.map(c => 
      c.id === id ? { ...c, statut: newStatut } : c
    );
    setCandidatures(updatedCandidatures);
    localStorage.setItem("candidatures", JSON.stringify(updatedCandidatures));
    
    const statutText = newStatut === "accepté" ? "acceptée" : newStatut === "refusé" ? "refusée" : "mise en attente";
    toast.success(`Candidature ${statutText}`);
  };

  const filteredCandidatures = useMemo(() => {
    return candidatures.filter(c => {
      const matchSearch = 
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchBac = filterBac === "tous" || c.typeBac === filterBac;
      const matchDiplome = filterDiplome === "tous" || c.typeDiplome === filterDiplome;
      const matchLicence = filterLicence === "tous" || c.licence === filterLicence;
      const matchStatut = filterStatut === "tous" || c.statut === filterStatut;

      return matchSearch && matchBac && matchDiplome && matchLicence && matchStatut;
    });
  }, [candidatures, searchTerm, filterBac, filterDiplome, filterLicence, filterStatut]);

  const stats = useMemo(() => {
    const total = candidatures.length;
    const acceptes = candidatures.filter(c => c.statut === "accepté").length;
    const refuses = candidatures.filter(c => c.statut === "refusé").length;
    const enAttente = candidatures.filter(c => c.statut === "en attente").length;

    const bacTypes: Record<string, number> = {};
    candidatures.forEach(c => {
      bacTypes[c.typeBac] = (bacTypes[c.typeBac] || 0) + 1;
    });

    const diplomeTypes: Record<string, number> = {};
    candidatures.forEach(c => {
      diplomeTypes[c.typeDiplome] = (diplomeTypes[c.typeDiplome] || 0) + 1;
    });

    const licenceTypes: Record<string, number> = {};
    candidatures.forEach(c => {
      licenceTypes[c.licence] = (licenceTypes[c.licence] || 0) + 1;
    });

    return { total, acceptes, refuses, enAttente, bacTypes, diplomeTypes, licenceTypes };
  }, [candidatures]);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "accepté":
        return <Badge className="bg-green-500 hover:bg-green-600">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500 hover:bg-red-600">Refusé</Badge>;
      case "en attente":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En attente</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  const calculateMoyenne = (c: Candidature) => {
    // Pour DEUST : moyenne de 2 notes seulement
    if (c.typeDiplome === "DEUST") {
      const notes = [
        parseFloat(c.noteS1),
        parseFloat(c.noteS2)
      ].filter(n => !isNaN(n));
      const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
      return moyenne.toFixed(2);
    }
    // Pour les autres : moyenne de 4 notes
    const notes = [
      parseFloat(c.noteS1),
      parseFloat(c.noteS2),
      parseFloat(c.noteS3),
      parseFloat(c.noteS4)
    ].filter(n => !isNaN(n));
    const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
    return moyenne.toFixed(2);
  };

  const handleExportCSV = () => {
    if (candidatures.length === 0) {
      toast.error("Aucune candidature à exporter");
      return;
    }

    // Créer le contenu CSV
    const headers = [
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Licence",
      "Type Diplôme",
      "Type Bac",
      "Année Bac",
      "Note S1/Année 1",
      "Note S2/Année 2",
      "Note S3",
      "Note S4",
      "Moyenne",
      "Statut",
      "Date de création"
    ];

    const rows = candidatures.map(c => [
      c.nom,
      c.prenom,
      c.email,
      c.telephone,
      c.licence,
      c.typeDiplome,
      c.typeBac,
      c.anneeBac,
      c.noteS1,
      c.noteS2,
      c.noteS3 || "",
      c.noteS4 || "",
      calculateMoyenne(c),
      c.statut,
      new Date(c.dateCreation).toLocaleDateString("fr-FR")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidatures_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export CSV réussi!");
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("Le fichier CSV est vide");
          return;
        }

        // Sauter l'en-tête
        const dataLines = lines.slice(1);
        
        const importedCandidatures: Candidature[] = [];
        let errorCount = 0;

        dataLines.forEach((line, index) => {
          try {
            // Parser la ligne CSV en tenant compte des guillemets
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanValues = values.map(v => v.replace(/^"|"$/g, "").trim());

            if (cleanValues.length < 8) {
              errorCount++;
              return;
            }

            const [nom, prenom, email, telephone, licence, typeDiplome, typeBac, anneeBac, noteS1, noteS2, noteS3, noteS4] = cleanValues;

            // Vérifier que l'email n'existe pas déjà
            const emailExists = candidatures.some(c => c.email === email) || 
                               importedCandidatures.some(c => c.email === email);
            
            if (emailExists) {
              errorCount++;
              return;
            }

            // Créer la candidature
            const candidature: Candidature = {
              id: `imported-${Date.now()}-${index}`,
              nom: nom || "",
              prenom: prenom || "",
              email: email || "",
              telephone: telephone || "",
              licence: licence || "",
              typeDiplome: typeDiplome || "DEUG",
              typeBac: typeBac || "",
              anneeBac: anneeBac || "",
              noteS1: noteS1 || "0",
              noteS2: noteS2 || "0",
              noteS3: noteS3 || "",
              noteS4: noteS4 || "",
              statut: "en attente",
              dateCreation: new Date().toISOString()
            };

            importedCandidatures.push(candidature);
          } catch (err) {
            errorCount++;
          }
        });

        if (importedCandidatures.length === 0) {
          toast.error("Aucune candidature valide trouvée dans le fichier");
          return;
        }

        // Fusionner avec les candidatures existantes
        const updatedCandidatures = [...candidatures, ...importedCandidatures];
        setCandidatures(updatedCandidatures);
        localStorage.setItem("candidatures", JSON.stringify(updatedCandidatures));

        toast.success(
          `${importedCandidatures.length} candidature(s) importée(s)${errorCount > 0 ? ` (${errorCount} ligne(s) ignorée(s))` : ""}`
        );
      } catch (error) {
        toast.error("Erreur lors de l'import du fichier CSV");
      }
    };

    reader.readAsText(file);
    // Réinitialiser l'input
    event.target.value = "";
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
          toast.error("Le fichier JSON doit contenir un tableau de candidatures");
          return;
        }

        const importedCandidatures: Candidature[] = [];
        let errorCount = 0;

        data.forEach((item, index) => {
          try {
            // Vérifier que l'email n'existe pas déjà
            const emailExists = candidatures.some(c => c.email === item.email) || 
                               importedCandidatures.some(c => c.email === item.email);
            
            if (emailExists || !item.email) {
              errorCount++;
              return;
            }

            const candidature: Candidature = {
              id: item.id || `imported-${Date.now()}-${index}`,
              nom: item.nom || "",
              prenom: item.prenom || "",
              email: item.email || "",
              telephone: item.telephone || "",
              licence: item.licence || "",
              typeDiplome: item.typeDiplome || "DEUG",
              typeBac: item.typeBac || "",
              anneeBac: item.anneeBac || "",
              noteS1: item.noteS1 || "0",
              noteS2: item.noteS2 || "0",
              noteS3: item.noteS3 || "",
              noteS4: item.noteS4 || "",
              statut: item.statut || "en attente",
              dateCreation: item.dateCreation || new Date().toISOString()
            };

            importedCandidatures.push(candidature);
          } catch (err) {
            errorCount++;
          }
        });

        if (importedCandidatures.length === 0) {
          toast.error("Aucune candidature valide trouvée dans le fichier");
          return;
        }

        // Fusionner avec les candidatures existantes
        const updatedCandidatures = [...candidatures, ...importedCandidatures];
        setCandidatures(updatedCandidatures);
        localStorage.setItem("candidatures", JSON.stringify(updatedCandidatures));

        toast.success(
          `${importedCandidatures.length} candidature(s) importée(s)${errorCount > 0 ? ` (${errorCount} enregistrement(s) ignoré(s))` : ""}`
        );
      } catch (error) {
        toast.error("Erreur lors de l'import du fichier JSON");
      }
    };

    reader.readAsText(file);
    // Réinitialiser l'input
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-gray-900">Tableau de bord - Administration</h1>
            <p className="text-gray-600">Gestion des candidatures au concours</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total candidatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl text-gray-900">{stats.total}</div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Acceptées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl text-green-600">{stats.acceptes}</div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Refusées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl text-red-600">{stats.refuses}</div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl text-yellow-600">{stats.enAttente}</div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Répartition par type de bac */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Répartition par type de baccalauréat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.bacTypes).map(([type, count]) => (
                <div key={type} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl text-indigo-900">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type de diplôme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Répartition par type de diplôme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.diplomeTypes).map(([type, count]) => (
                <div key={type} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl text-indigo-900">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par licence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Répartition par licence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.licenceTypes).map(([type, count]) => (
                <div key={type} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl text-indigo-900">{count}</div>
                  <div className="text-sm text-gray-600">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des candidatures</CardTitle>
            <CardDescription>
              {filteredCandidatures.length} candidature(s) affichée(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterBac} onValueChange={setFilterBac}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrer par bac" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les bacs</SelectItem>
                  <SelectItem value="Sciences Mathématiques">Sciences Mathématiques</SelectItem>
                  <SelectItem value="Sciences Physiques">Sciences Physiques</SelectItem>
                  <SelectItem value="Sciences de la Vie et de la Terre">Sciences de la Vie et de la Terre</SelectItem>
                  <SelectItem value="Sciences Économiques">Sciences Économiques</SelectItem>
                  <SelectItem value="Lettres">Lettres</SelectItem>
                  <SelectItem value="Technique">Technique</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDiplome} onValueChange={setFilterDiplome}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrer par diplôme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les diplômes</SelectItem>
                  <SelectItem value="DEUST">DEUST</SelectItem>
                  <SelectItem value="DEUG">DEUG</SelectItem>
                  <SelectItem value="BTS">BTS</SelectItem>
                  <SelectItem value="DUT">DUT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLicence} onValueChange={setFilterLicence}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrer par licence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes les licences</SelectItem>
                  <SelectItem value="GCF">GCF</SelectItem>
                  <SelectItem value="BDAPA">BDAPA</SelectItem>
                  <SelectItem value="CCA">CCA</SelectItem>
                  <SelectItem value="CSTC">CSTC</SelectItem>
                  <SelectItem value="ISITW">ISITW</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="accepté">Accepté</SelectItem>
                  <SelectItem value="refusé">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type Bac</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Moyenne</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidatures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune candidature trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidatures.map((candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell>
                          {candidature.nom} {candidature.prenom}
                        </TableCell>
                        <TableCell className="text-gray-600">{candidature.email}</TableCell>
                        <TableCell className="text-sm">{candidature.typeBac}</TableCell>
                        <TableCell>{candidature.anneeBac}</TableCell>
                        <TableCell>
                          <span className="text-indigo-600">
                            {calculateMoyenne(candidature)}/20
                          </span>
                        </TableCell>
                        <TableCell>{getStatutBadge(candidature.statut)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCandidature(candidature)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Dossier de candidature - {selectedCandidature?.nom} {selectedCandidature?.prenom}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Détails complets de la candidature
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCandidature && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600">Nom</p>
                                        <p>{selectedCandidature.nom}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Prénom</p>
                                        <p>{selectedCandidature.prenom}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p>{selectedCandidature.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Téléphone</p>
                                        <p>{selectedCandidature.telephone}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Licence</p>
                                        <p>{selectedCandidature.licence}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Type de diplôme</p>
                                        <p>{selectedCandidature.typeDiplome}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">Type de bac</p>
                                        <p>{selectedCandidature.typeBac}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {selectedCandidature.typeDiplome === "DEUST" ? "Moyennes annuelles" : "Notes académiques"}
                                      </p>
                                      {selectedCandidature.typeDiplome === "DEUST" ? (
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">1ère année</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS1}</p>
                                          </div>
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">2ème année</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS2}</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">S1</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS1}</p>
                                          </div>
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">S2</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS2}</p>
                                          </div>
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">S3</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS3}</p>
                                          </div>
                                          <div className="bg-indigo-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">S4</p>
                                            <p className="text-xl text-indigo-900">{selectedCandidature.noteS4}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="mt-2 bg-indigo-100 p-3 rounded">
                                        <p className="text-sm text-gray-600">Moyenne générale</p>
                                        <p className="text-2xl text-indigo-900">
                                          {calculateMoyenne(selectedCandidature)}/20
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
                                      {getStatutBadge(selectedCandidature.statut)}
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                      <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => updateStatut(selectedCandidature.id, "accepté")}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Accepter
                                      </Button>
                                      <Button
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                        onClick={() => updateStatut(selectedCandidature.id, "en attente")}
                                      >
                                        <Clock className="w-4 h-4 mr-2" />
                                        En attente
                                      </Button>
                                      <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={() => updateStatut(selectedCandidature.id, "refusé")}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Refuser
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => updateStatut(candidature.id, "accepté")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => updateStatut(candidature.id, "refusé")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Import/Export */}
        <Card>
          <CardHeader>
            <CardTitle>Import/Export</CardTitle>
            <CardDescription>
              Importez des listes de candidatures (CSV ou JSON) ou exportez les données existantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="bg-indigo-50 hover:bg-indigo-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter en CSV
              </Button>

              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer CSV
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>

              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer JSON
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="text-gray-700 mb-2">Format CSV attendu :</p>
              <code className="text-xs bg-white px-2 py-1 rounded">
                Nom,Prénom,Email,Téléphone,Licence,Type Diplôme,Type Bac,Année Bac,Note S1,Note S2,Note S3,Note S4
              </code>
              <p className="text-gray-600 mt-2">
                • Les emails en double seront ignorés
                <br />
                • Pour DEUST, seules les 2 premières notes sont nécessaires
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}