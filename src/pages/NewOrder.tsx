import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRestaurant } from "../hooks/useRestaurant";
import { useSuppliers } from "../hooks/useSuppliers";
import { useProducts } from "../hooks/useProducts";
import { useOrders } from "../hooks/useOrders";
import type { OrderItemView } from "../lib/orderText";
import { OrderExportView } from "../components/OrderExportView";
import { Button } from "../components/Button";

export function NewOrder() {
  const { restaurant } = useRestaurant();
  const { suppliers, loading: suppliersLoading } = useSuppliers(restaurant?.id);
  const { products, loading: productsLoading } = useProducts(restaurant?.id);
  const { createOrder } = useOrders();

  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ createdAt: string; items: OrderItemView[] } | null>(null);

  const loading = suppliersLoading || productsLoading;
  const suppliersWithProducts = suppliers.filter((s) => products.some((p) => p.supplier_id === s.id));

  function reset() {
    setCreated(null);
    setQuantities({});
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;

    const selected = products.filter((p) => Number(quantities[p.id]) > 0);
    if (selected.length === 0) {
      setFormError("Επίλεξε ποσότητα για τουλάχιστον ένα προϊόν.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const orderItems = selected.map((p) => ({
      product_id: p.id,
      supplier_id: p.supplier_id,
      product_name_snapshot: p.name,
      unit: p.unit,
      quantity: Number(quantities[p.id]),
      price_at_order: p.last_known_price,
    }));

    const { error, order } = await createOrder(restaurant.id, orderItems);
    setSubmitting(false);

    if (error || !order) {
      setFormError(error ?? "Κάτι πήγε στραβά.");
      return;
    }

    const itemsView: OrderItemView[] = orderItems.map((item) => {
      const supplier = suppliers.find((s) => s.id === item.supplier_id);
      return {
        supplier_id: item.supplier_id,
        supplier_name: supplier?.name ?? "",
        supplier_phone: supplier?.contact_phone ?? null,
        product_name_snapshot: item.product_name_snapshot,
        unit: item.unit,
        quantity: item.quantity,
      };
    });

    setCreated({ createdAt: order.created_at, items: itemsView });
  }

  if (created) {
    return <OrderExportView createdAt={created.createdAt} items={created.items} onReset={reset} />;
  }

  if (!loading && suppliersWithProducts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Πρόσθεσε πρώτα προϊόντα για να φτιάξεις παραγγελία.</p>
        <Link to="/products">
          <Button className="mt-4">Μετάβαση στα Προϊόντα</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Νέα Παραγγελία</h1>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Δημιουργία..." : "Δημιουργία Παραγγελίας"}
        </Button>
      </div>

      {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {suppliersWithProducts.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-medium text-gray-900 mb-3">{supplier.name}</h2>
              <div className="flex flex-col divide-y divide-gray-100">
                {products
                  .filter((p) => p.supplier_id === supplier.id)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 gap-4">
                      <span className="text-sm text-gray-800">
                        {product.name} <span className="text-gray-400">({product.unit})</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0"
                        value={quantities[product.id] ?? ""}
                        onChange={(e) => setQuantities({ ...quantities, [product.id]: e.target.value })}
                        className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
