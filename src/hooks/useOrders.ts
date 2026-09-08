import { supabase } from "../lib/supabase";
import type { Order } from "../types/database";
import type { OrderItemView } from "../lib/orderText";

export interface NewOrderItemInput {
  product_id: string;
  supplier_id: string;
  product_name_snapshot: string;
  unit: string;
  quantity: number;
  price_at_order: number | null;
}

export interface OrderSummary extends Order {
  item_count: number;
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

  async function listOrders(restaurantId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(count)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) return { orders: [] as OrderSummary[], error: error.message };

    const orders: OrderSummary[] = (data ?? []).map((row) => {
      const { order_items, ...order } = row as Order & { order_items: { count: number }[] };
      return { ...order, item_count: order_items?.[0]?.count ?? 0 };
    });

    return { orders, error: null };
  }

  async function getOrder(orderId: string) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderError || !order) {
      return { order: null as Order | null, items: [] as OrderItemView[], error: orderError?.message ?? "Δεν βρέθηκε η παραγγελία." };
    }

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select("*, suppliers(name, contact_phone)")
      .eq("order_id", orderId);

    if (itemsError) {
      return { order: order as Order, items: [] as OrderItemView[], error: itemsError.message };
    }

    const items: OrderItemView[] = (itemRows ?? []).map((row) => ({
      supplier_id: row.supplier_id,
      supplier_name: row.suppliers?.name ?? "",
      supplier_phone: row.suppliers?.contact_phone ?? null,
      product_id: row.product_id,
      product_name_snapshot: row.product_name_snapshot,
      unit: row.unit,
      quantity: row.quantity,
    }));

    return { order: order as Order, items, error: null };
  }

  return { createOrder, listOrders, getOrder };
}
