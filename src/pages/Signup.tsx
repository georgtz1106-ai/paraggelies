import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function Signup() {
  const { signUp } = useAuth();
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signUp(email, password, restaurantName);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Σχεδόν έτοιμοι!</h1>
          <p className="text-sm text-gray-600">
            Έλεγξε το email σου <strong>{email}</strong> και επιβεβαίωσε τον λογαριασμό σου για να συνδεθείς.
          </p>
          <Link to="/login" className="text-emerald-600 font-medium text-sm mt-4 inline-block">
            Μετάβαση στη σύνδεση
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Παραγγελίες</h1>
        <p className="text-sm text-gray-500 mb-6">Δημιουργία νέου λογαριασμού εστιατορίου</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Όνομα εστιατορίου"
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
            placeholder="π.χ. Ταβέρνα Ο Γιώργος"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Κωδικός"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Δημιουργία..." : "Δημιουργία λογαριασμού"}
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Έχεις ήδη λογαριασμό;{" "}
          <Link to="/login" className="text-emerald-600 font-medium">
            Σύνδεση
          </Link>
        </p>
      </div>
    </div>
  );
}
