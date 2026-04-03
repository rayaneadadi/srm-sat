import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Star, Send, CheckCircle2 } from "lucide-react";
import srmLogo from "../../imports/image.png";

interface SatisfactionData {
  id: string;
  date: string;
  nomClient: string;
  email: string;
  telephone: string;
  categorieService: string;
  typeService: string;
  dateService: string;
  satisfactionGlobale: number;
  qualiteService: number;
  professionnalisme: number;
  delais: number;
  rapportQualite: number;
  commentaires: string;
  suggestions: string;
}

export function SatisfactionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<SatisfactionData>>(
    {
      categorieService: "",
      typeService: "",
      satisfactionGlobale: 0,
      qualiteService: 0,
      professionnalisme: 0,
      delais: 0,
      rapportQualite: 0,
    }
  );

  const [hoveredRatings, setHoveredRatings] = useState<{
    [key: string]: number;
  }>({});

  const categoriesOptions = ["Incident", "Demande"];

  const servicesOptions = [
    "Application",
    "PC",
    "Imprimante",
    "GSM",
    "Poste téléphonique",
    "Autre",
  ];

  const renderStarRating = (field: keyof SatisfactionData, label: string) => {
    const currentRating = formData[field] as number || 0;
    const hoveredRating = hoveredRatings[field] || 0;

    return (
      <div className="space-y-2">
        <Label className="text-base font-medium">{label}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, [field]: star })}
              onMouseEnter={() => setHoveredRatings({ ...hoveredRatings, [field]: star })}
              onMouseLeave={() => setHoveredRatings({ ...hoveredRatings, [field]: 0 })}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || currentRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 flex items-center">
            {currentRating > 0 ? `${currentRating}/5` : "Non évalué"}
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nomClient || !formData.email || !formData.telephone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!formData.categorieService || !formData.typeService) {
      toast.error("Veuillez sélectionner la catégorie et le type de service");
      return;
    }

    if (
      !formData.satisfactionGlobale ||
      !formData.qualiteService ||
      !formData.professionnalisme ||
      !formData.delais ||
      !formData.rapportQualite
    ) {
      toast.error("Veuillez évaluer tous les critères avec les étoiles");
      return;
    }

    // Créer l'objet de satisfaction
    const satisfaction: SatisfactionData = {
      id: `SAT-${Date.now()}`,
      date: new Date().toISOString(),
      nomClient: formData.nomClient!,
      email: formData.email!,
      telephone: formData.telephone!,
      categorieService: formData.categorieService!,
      typeService: formData.typeService!,
      dateService: formData.dateService || "",
      satisfactionGlobale: formData.satisfactionGlobale!,
      qualiteService: formData.qualiteService!,
      professionnalisme: formData.professionnalisme!,
      delais: formData.delais!,
      rapportQualite: formData.rapportQualite!,
      commentaires: formData.commentaires || "",
      suggestions: formData.suggestions || "",
    };

    // Sauvegarder dans localStorage
    const existingSatisfactions = JSON.parse(
      localStorage.getItem("satisfactions") || "[]"
    );
    existingSatisfactions.push(satisfaction);
    localStorage.setItem("satisfactions", JSON.stringify(existingSatisfactions));

    toast.success("Merci pour votre retour ! Votre avis a été enregistré.");
    setSubmitted(true);
  };

  const handleNewForm = () => {
    setSubmitted(false);
    setFormData({
      categorieService: "",
      typeService: "",
      satisfactionGlobale: 0,
      qualiteService: 0,
      professionnalisme: 0,
      delais: 0,
      rapportQualite: 0,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Merci pour votre retour !
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Votre avis est précieux pour nous et nous aide à améliorer continuellement nos services.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex justify-center mb-3">
                <img
                  src={srmLogo}
                  alt="SRM Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-blue-900 font-medium">
                SRM - Société Régionale Multiservices
              </p>
              <p className="text-sm text-blue-700">Casablanca - Settat</p>
            </div>
            <Button onClick={handleNewForm} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Soumettre un autre formulaire
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white py-8 px-4 rounded-t-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={srmLogo}
                alt="SRM Logo"
                className="h-20 w-auto object-contain bg-white rounded-lg p-2"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">SRM</h1>
            <p className="text-xl mb-1">Société Régionale Multiservices</p>
            <p className="text-blue-100">Casablanca - Settat</p>
          </div>
          <div className="bg-white py-6 px-4 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Formulaire de Satisfaction Client
            </h2>
            <p className="text-gray-600">
              Votre avis nous aide à améliorer nos services
            </p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle>Évaluation de nos services</CardTitle>
            <CardDescription>
              Les champs marqués d'un astérisque (*) sont obligatoires
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations client */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informations client
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomClient">Nom complet *</Label>
                    <Input
                      id="nomClient"
                      value={formData.nomClient || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nomClient: e.target.value })
                      }
                      placeholder="Nom et prénom"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={formData.telephone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                      placeholder="+212 6XX XXX XXX"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateService">Date du service</Label>
                    <Input
                      id="dateService"
                      type="date"
                      value={formData.dateService || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, dateService: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categorieService">Catégorie de service reçu *</Label>
                  <Select
                    value={formData.categorieService}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categorieService: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la catégorie de service" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="typeService">Type de service reçu *</Label>
                  <Select
                    value={formData.typeService}
                    onValueChange={(value) =>
                      setFormData({ ...formData, typeService: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesOptions.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Évaluations */}
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Évaluation des services *
                </h3>
                <p className="text-sm text-gray-600">
                  Veuillez évaluer chaque critère de 1 à 5 étoiles
                </p>

                {renderStarRating("satisfactionGlobale", "Satisfaction globale")}
                {renderStarRating("qualiteService", "Qualité du service")}
                {renderStarRating("professionnalisme", "Professionnalisme de l'équipe")}
                {renderStarRating("delais", "Respect des délais")}
                {renderStarRating("rapportQualite", "Rapport qualité")}
              </div>

              {/* Commentaires */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="commentaires">
                    Commentaires additionnels
                  </Label>
                  <Textarea
                    id="commentaires"
                    value={formData.commentaires || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, commentaires: e.target.value })
                    }
                    placeholder="Partagez votre expérience avec nous..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="suggestions">
                    Suggestions d'amélioration
                  </Label>
                  <Textarea
                    id="suggestions"
                    value={formData.suggestions || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, suggestions: e.target.value })
                    }
                    placeholder="Comment pouvons-nous améliorer nos services ?"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le formulaire
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Merci de votre confiance</p>
          <p className="font-medium text-blue-600">
            SRM - Société Régionale Multiservices | Casablanca - Settat
          </p>
        </div>
      </div>
    </div>
  );
}