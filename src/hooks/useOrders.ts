import { supabase } from "../lib/supabase";
import type { Order } from "../types/database";

export interface NewOrderItemInput {
  product_id: string;
  supplier_id: string;
  product_name_snapshot: string;
  unit: string;
  quantity: number;
  price_at_order: number | null;
}

export function useOrders() {
  async function createOrder(restaurantId: string, items: NewOrderItemInput[]) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ restaurant_id: restaurantId })
      .select()
      .single();

    if (orderError || !order) {
      return { error: orderError?.message ?? "Αποτυχία δημιουργίας παραγγελίας.", order: null as Order | null };
    }

    const rows = items.map((item) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      return { error: itemsError.message, order: null as Order | null };
    }

    return { error: null, order: order as Order };
  }

  return { createOrder };
}
