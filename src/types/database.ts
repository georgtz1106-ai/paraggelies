export type Unit = "κιλά" | "τεμάχια" | "συσκευασία" | "λίτρα" | "κιβώτιο" | "κούτα";

export const UNITS: Unit[] = ["κιλά", "τεμάχια", "συσκευασία", "λίτρα", "κιβώτιο", "κούτα"];

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  restaurant_id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  supplier_id: string;
  name: string;
  unit: string;
  last_known_price: number | null;
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  supplier_id: string;
  product_name_snapshot: string;
  unit: string;
  quantity: number;
  price_at_order: number | null;
  created_at: string;
}
