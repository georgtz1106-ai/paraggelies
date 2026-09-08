import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Restaurant } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export function useRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    supabase
      .from("restaurants")
      .select("*")
      .single()
      .then(({ data }) => {
        if (active) {
          setRestaurant(data ?? null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  return { restaurant, loading };
}
