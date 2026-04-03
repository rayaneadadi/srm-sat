import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { LogIn, UserCircle } from "lucide-react";

interface CandidatLoginProps {
  onLogin: (email: string) => void;
  onReturnToForm: () => void;
}

export function CandidatLogin({ onLogin, onReturnToForm }: CandidatLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Récupérer les candidatures
    const candidatures = JSON.parse(localStorage.getItem("candidatures") || "[]");
    
    // Trouver la candidature avec cet email et mot de passe
    const candidature = candidatures.find(
      (c: any) => c.email === email && c.motDePasse === password
    );

    if (candidature) {
      localStorage.setItem("candidatLoggedIn", email);
      toast.success("Connexion réussie!");
      onLogin(email);
    } else {
      toast.error("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-indigo-600 p-4 rounded-full">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center">Connexion Candidat</CardTitle>
          <CardDescription className="text-center">
            Accédez à votre dossier de candidature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Button>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                onClick={onReturnToForm}
                className="text-indigo-600"
              >
                Pas encore de compte ? Créer une candidature
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
