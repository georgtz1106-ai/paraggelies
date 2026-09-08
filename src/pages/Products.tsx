import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRestaurant } from "../hooks/useRestaurant";
import { useSuppliers } from "../hooks/useSuppliers";
import { useProducts, type ProductInput } from "../hooks/useProducts";
import type { Product } from "../types/database";
import { UNITS } from "../types/database";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Button } from "../components/Button";

function emptyForm(supplierId: string): ProductInput {
  return { supplier_id: supplierId, name: "", unit: UNITS[0], last_known_price: "" };
}

export function Products() {
  const { restaurant } = useRestaurant();
  const { suppliers, loading: suppliersLoading } = useSuppliers(restaurant?.id);
  const { products, loading: productsLoading, error, addProduct, updateProduct, deleteProduct } = useProducts(
    restaurant?.id
  );

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductInput>(emptyForm(""));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loading = suppliersLoading || productsLoading;

  function openAddForm(supplierId: string) {
    setEditing(null);
    setForm(emptyForm(supplierId));
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    setForm({
      supplier_id: product.supplier_id,
      name: product.name,
      unit: product.unit,
      last_known_price: product.last_known_price != null ? String(product.last_known_price) : "",
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = editing ? await updateProduct(editing.id, form) : await addProduct(form);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setShowForm(false);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Διαγραφή προϊόντος "${product.name}";`)) return;
    await deleteProduct(product.id);
  }

  if (!loading && suppliers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Πρόσθεσε πρώτα έναν προμηθευτή για να καταχωρήσεις προϊόντα.</p>
        <Link to="/suppliers">
          <Button className="mt-4">Μετάβαση στους Προμηθευτές</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Προϊόντα</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      ) : (
        <div className="flex flex-col gap-6">
          {suppliers.map((supplier) => {
            const supplierProducts = products.filter((p) => p.supplier_id === supplier.id);
            return (
              <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-gray-900">{supplier.name}</h2>
                  <Button variant="secondary" onClick={() => openAddForm(supplier.id)}>
                    + Προϊόν
                  </Button>
                </div>
                {supplierProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">Δεν έχει προϊόντα ακόμα.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-gray-100">
                    {supplierProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.unit}
                            {product.last_known_price != null ? ` · €${product.last_known_price}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <button onClick={() => openEditForm(product)} className="text-gray-500 hover:text-emerald-600">
                            Επεξεργασία
                          </button>
                          <button onClick={() => handleDelete(product)} className="text-gray-500 hover:text-red-600">
                            Διαγραφή
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Επεξεργασία Προϊόντος" : "Νέο Προϊόν"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select
              label="Προμηθευτής"
              value={form.supplier_id}
              onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              required
            />
            <Input
              label="Όνομα προϊόντος"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="π.χ. Ντομάτες"
            />
            <Select
              label="Μονάδα μέτρησης"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              options={UNITS.map((u) => ({ value: u, label: u }))}
            />
            <Input
              label="Τελευταία τιμή (€, προαιρετικό)"
              type="number"
              step="0.01"
              min="0"
              value={form.last_known_price}
              onChange={(e) => setForm({ ...form, last_known_price: e.target.value })}
            />
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Ακύρωση
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Αποθήκευση..." : "Αποθήκευση"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
