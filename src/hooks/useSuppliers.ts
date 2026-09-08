import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Supplier } from "../types/database";

export interface SupplierInput {
  name: string;
  contact_phone: string;
  contact_email: string;
  notes: string;
}

export function useSuppliers(restaurantId: string | undefined) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name");
    if (error) {
      setError(error.message);
    } else {
      setSuppliers(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addSupplier(input: SupplierInput) {
    if (!restaurantId) return { error: "Δεν βρέθηκε εστιατόριο." };
    const { error } = await supabase.from("suppliers").insert({
      restaurant_id: restaurantId,
      name: input.name,
      contact_phone: input.contact_phone || null,
      contact_email: input.contact_email || null,
      notes: input.notes || null,
    });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function updateSupplier(id: string, input: SupplierInput) {
    const { error } = await supabase
      .from("suppliers")
      .update({
        name: input.name,
        contact_phone: input.contact_phone || null,
        contact_email: input.contact_email || null,
        notes: input.notes || null,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  async function deleteSupplier(id: string) {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }

  return { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier };
}
