import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Λείπουν τα VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Αντέγραψε το .env.local.example σε .env.local και συμπλήρωσε τα στοιχεία του Supabase project σου."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
