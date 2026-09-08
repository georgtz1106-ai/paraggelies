export interface OrderItemView {
  supplier_id: string;
  supplier_name: string;
  supplier_phone: string | null;
  product_name_snapshot: string;
  unit: string;
  quantity: number;
}

export function groupItemsBySupplier(items: OrderItemView[]): OrderItemView[][] {
  const map = new Map<string, OrderItemView[]>();
  for (const item of items) {
    if (!map.has(item.supplier_id)) map.set(item.supplier_id, []);
    map.get(item.supplier_id)!.push(item);
  }
  return [...map.values()];
}

export function formatDateGreek(iso: string): string {
  return new Date(iso).toLocaleDateString("el-GR");
}

export function buildSupplierText(items: OrderItemView[], createdAt: string): string {
  const supplierName = items[0]?.supplier_name ?? "";
  const lines = [`Παραγγελία ${formatDateGreek(createdAt)}`, `${supplierName}:`];
  for (const item of items) {
    lines.push(`- ${item.product_name_snapshot}: ${item.quantity} ${item.unit}`);
  }
  return lines.join("\n");
}

export function toWhatsAppLink(phone: string | null, text: string): string {
  const encoded = encodeURIComponent(text);
  if (!phone) return `https://wa.me/?text=${encoded}`;
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("30") ? digits : `30${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${withCountryCode}?text=${encoded}`;
}
