import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { GraduationCap, LogOut, Save, FileText } from "lucide-react";

interface CandidatureData {
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
  motDePasse: string;
  statut: "en attente" | "accepté" | "refusé";
  dateCreation: string;
}

interface CandidatDashboardProps {
  email: string;
  onLogout: () => void;
}

export function CandidatDashboard({ email, onLogout }: CandidatDashboardProps) {
  const [candidature, setCandidature] = useState<CandidatureData | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    licence: "",
    typeDiplome: "",
    typeBac: "",
    anneeBac: "",
    noteS1: "",
    noteS2: "",
    noteS3: "",
    noteS4: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCandidature();
  }, [email]);

  const loadCandidature = () => {
    const candidatures = JSON.parse(localStorage.getItem("candidatures") || "[]");
    const found = candidatures.find((c: CandidatureData) => c.email === email);
    
    if (found) {
      setCandidature(found);
      setFormData({
        nom: found.nom,
        prenom: found.prenom,
        telephone: found.telephone,
        licence: found.licence,
        typeDiplome: found.typeDiplome,
        typeBac: found.typeBac,
        anneeBac: found.anneeBac,
        noteS1: found.noteS1,
        noteS2: found.noteS2,
        noteS3: found.noteS3,
        noteS4: found.noteS4,
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Reset notes when changing type de diplome
    if (field === "typeDiplome") {
      setFormData(prev => ({
        ...prev,
        noteS1: "",
        noteS2: "",
        noteS3: "",
        noteS4: "",
      }));
      setErrors(prev => ({
        ...prev,
        noteS1: "",
        noteS2: "",
        noteS3: "",
        noteS4: "",
      }));
    }
  };

  const isDEUST = formData.typeDiplome === "DEUST";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!phoneRegex.test(formData.telephone.replace(/\s/g, ""))) {
      newErrors.telephone = "Téléphone invalide (10 chiffres)";
    }

    if (!formData.licence) newErrors.licence = "Le choix de la licence est requis";
    if (!formData.typeDiplome) newErrors.typeDiplome = "Le type de diplôme est requis";
    if (!formData.typeBac) newErrors.typeBac = "Le type de bac est requis";
    if (!formData.anneeBac) newErrors.anneeBac = "L'année du bac est requise";

    const validateNote = (note: string, semestre: string, label: string) => {
      if (!note.trim()) {
        newErrors[semestre] = `${label} est requise`;
        return false;
      }
      const noteNum = parseFloat(note);
      if (isNaN(noteNum) || noteNum < 0 || noteNum > 20) {
        newErrors[semestre] = `Note invalide (0-20)`;
        return false;
      }
      return true;
    };

    if (isDEUST) {
      validateNote(formData.noteS1, "noteS1", "La moyenne de la 1ère année");
      validateNote(formData.noteS2, "noteS2", "La moyenne de la 2ème année");
    } else {
      validateNote(formData.noteS1, "noteS1", "La note S1");
      validateNote(formData.noteS2, "noteS2", "La note S2");
      validateNote(formData.noteS3, "noteS3", "La note S3");
      validateNote(formData.noteS4, "noteS4", "La note S4");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    if (!candidature) return;

    // Mettre à jour la candidature
    const candidatures = JSON.parse(localStorage.getItem("candidatures") || "[]");
    const index = candidatures.findIndex((c: CandidatureData) => c.id === candidature.id);

    if (index !== -1) {
      candidatures[index] = {
        ...candidatures[index],
        ...formData,
        noteS3: isDEUST ? "" : formData.noteS3,
        noteS4: isDEUST ? "" : formData.noteS4,
      };
      localStorage.setItem("candidatures", JSON.stringify(candidatures));
      toast.success("Candidature mise à jour avec succès!");
      loadCandidature();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("candidatLoggedIn");
    toast.success("Déconnexion réussie");
    onLogout();
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "accepté":
        return <Badge className="bg-green-500">Accepté</Badge>;
      case "refusé":
        return <Badge className="bg-red-500">Refusé</Badge>;
      default:
        return <Badge className="bg-yellow-500">En attente</Badge>;
    }
  };

  if (!candidature) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-4 rounded-full">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-indigo-900">Mon Dossier de Candidature</h1>
              <p className="text-gray-600">Vous pouvez modifier vos informations</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Statut */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Statut de votre candidature</p>
                  <p className="text-lg">{getStatutBadge(candidature.statut)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date de soumission</p>
                <p>{new Date(candidature.dateCreation).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de modification */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Modifier ma candidature</CardTitle>
            <CardDescription>
              Corrigez vos informations si nécessaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-indigo-900">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleChange("nom", e.target.value)}
                      placeholder="Votre nom"
                      className={errors.nom ? "border-red-500" : ""}
                    />
                    {errors.nom && <p className="text-red-500 text-sm">{errors.nom}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => handleChange("prenom", e.target.value)}
                      placeholder="Votre prénom"
                      className={errors.prenom ? "border-red-500" : ""}
                    />
                    {errors.prenom && <p className="text-red-500 text-sm">{errors.prenom}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (non modifiable)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleChange("telephone", e.target.value)}
                      placeholder="0612345678"
                      className={errors.telephone ? "border-red-500" : ""}
                    />
                    {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone}</p>}
                  </div>
                </div>
              </div>

              {/* Type de diplôme */}
              <div className="space-y-4">
                <h3 className="text-indigo-900">Formation</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="licence">Choix de la licence *</Label>
                  <Select value={formData.licence} onValueChange={(value) => handleChange("licence", value)}>
                    <SelectTrigger className={errors.licence ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez une licence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GCF">GCF : Gestion Comptable et Financière</SelectItem>
                      <SelectItem value="BDAPA">BDAPA : Biotechnologie, Digitalisation et Amélioration de la Production Agricole</SelectItem>
                      <SelectItem value="CCA">CCA : Comptabilité, Contrôle et Audit</SelectItem>
                      <SelectItem value="CSTC">CSTC : Cyber Sécurité et Technologies Cloud</SelectItem>
                      <SelectItem value="ISITW">ISITW : Ingénierie des Systèmes Informatiques et Technologies Web</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.licence && <p className="text-red-500 text-sm">{errors.licence}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="typeDiplome">Type de diplôme *</Label>
                  <Select value={formData.typeDiplome} onValueChange={(value) => handleChange("typeDiplome", value)}>
                    <SelectTrigger className={errors.typeDiplome ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez un type de diplôme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEUST">DEUST</SelectItem>
                      <SelectItem value="DEUG">DEUG</SelectItem>
                      <SelectItem value="BTS">BTS</SelectItem>
                      <SelectItem value="DUT">DUT</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.typeDiplome && <p className="text-red-500 text-sm">{errors.typeDiplome}</p>}
                </div>
              </div>

              {/* Informations du baccalauréat */}
              <div className="space-y-4">
                <h3 className="text-indigo-900">Baccalauréat</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeBac">Type de baccalauréat *</Label>
                    <Select value={formData.typeBac} onValueChange={(value) => handleChange("typeBac", value)}>
                      <SelectTrigger className={errors.typeBac ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sciences Mathématiques">Sciences Mathématiques</SelectItem>
                        <SelectItem value="Sciences Physiques">Sciences Physiques</SelectItem>
                        <SelectItem value="Sciences de la Vie et de la Terre">Sciences de la Vie et de la Terre</SelectItem>
                        <SelectItem value="Sciences Économiques">Sciences Économiques</SelectItem>
                        <SelectItem value="Lettres">Lettres</SelectItem>
                        <SelectItem value="Technique">Technique</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.typeBac && <p className="text-red-500 text-sm">{errors.typeBac}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anneeBac">Année d'obtention *</Label>
                    <Select value={formData.anneeBac} onValueChange={(value) => handleChange("anneeBac", value)}>
                      <SelectTrigger className={errors.anneeBac ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez une année" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.anneeBac && <p className="text-red-500 text-sm">{errors.anneeBac}</p>}
                  </div>
                </div>
              </div>

              {/* Notes académiques */}
              {formData.typeDiplome && (
                <div className="space-y-4">
                  <h3 className="text-indigo-900">
                    {isDEUST ? "Moyennes annuelles (sur 20)" : "Notes académiques (sur 20)"}
                  </h3>
                  
                  {isDEUST ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="noteS1">Moyenne 1ère année *</Label>
                        <Input
                          id="noteS1"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS1}
                          onChange={(e) => handleChange("noteS1", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS1 ? "border-red-500" : ""}
                        />
                        {errors.noteS1 && <p className="text-red-500 text-sm">{errors.noteS1}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noteS2">Moyenne 2ème année *</Label>
                        <Input
                          id="noteS2"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS2}
                          onChange={(e) => handleChange("noteS2", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS2 ? "border-red-500" : ""}
                        />
                        {errors.noteS2 && <p className="text-red-500 text-sm">{errors.noteS2}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="noteS1">Semestre 1 *</Label>
                        <Input
                          id="noteS1"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS1}
                          onChange={(e) => handleChange("noteS1", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS1 ? "border-red-500" : ""}
                        />
                        {errors.noteS1 && <p className="text-red-500 text-sm">{errors.noteS1}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noteS2">Semestre 2 *</Label>
                        <Input
                          id="noteS2"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS2}
                          onChange={(e) => handleChange("noteS2", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS2 ? "border-red-500" : ""}
                        />
                        {errors.noteS2 && <p className="text-red-500 text-sm">{errors.noteS2}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noteS3">Semestre 3 *</Label>
                        <Input
                          id="noteS3"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS3}
                          onChange={(e) => handleChange("noteS3", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS3 ? "border-red-500" : ""}
                        />
                        {errors.noteS3 && <p className="text-red-500 text-sm">{errors.noteS3}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noteS4">Semestre 4 *</Label>
                        <Input
                          id="noteS4"
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={formData.noteS4}
                          onChange={(e) => handleChange("noteS4", e.target.value)}
                          placeholder="0.00"
                          className={errors.noteS4 ? "border-red-500" : ""}
                        />
                        {errors.noteS4 && <p className="text-red-500 text-sm">{errors.noteS4}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}