import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../types/database";

export interface ProductInput {
  supplier_id: string;
  name: string;
  unit: string;
  last_known_price: string;
}

export function useProducts(restaurantId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");
    if (error) {
      setError(error.message);
    } else {
      setProducts(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toRow(input: ProductInput) {
    return {
      supplier_id: input.supplier_id,
      name: input.name,
      unit: input.unit,
      last_known_price: input.last_known_price ? Number(input.last_known_price) : null,
    };
  }

  async function addProduct(input: ProductInput) {
    if (!restaurantId) return { error: "Δεν βρέθηκε εστιατόριο." };
    const { error } = await supabase.from("products").insert({ restaurant_id: restaurantId, ...toRow(input) });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updateProduct(id: string, input: ProductInput) {
    const { error } = await supabase.from("products").update(toRow(input)).eq("id", id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  return { products, loading, error, addProduct, updateProduct, deleteProduct };
}
