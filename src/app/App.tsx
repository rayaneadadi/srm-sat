import { SatisfactionForm } from "./components/SatisfactionForm";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen">
      <SatisfactionForm />
      <Toaster />
    </div>
  );
}