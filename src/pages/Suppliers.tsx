import { useState, type FormEvent } from "react";
import { useRestaurant } from "../hooks/useRestaurant";
import { useSuppliers, type SupplierInput } from "../hooks/useSuppliers";
import type { Supplier } from "../types/database";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const emptyForm: SupplierInput = { name: "", contact_phone: "", contact_email: "", notes: "" };

export function Suppliers() {
  const { restaurant } = useRestaurant();
  const { suppliers, loading, error, addSupplier, updateSupplier, deleteSupplier } = useSuppliers(restaurant?.id);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SupplierInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openAddForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(supplier: Supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact_phone: supplier.contact_phone ?? "",
      contact_email: supplier.contact_email ?? "",
      notes: supplier.notes ?? "",
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = editing ? await updateSupplier(editing.id, form) : await addSupplier(form);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setShowForm(false);
  }

  async function handleDelete(supplier: Supplier) {
    if (!confirm(`Διαγραφή προμηθευτή "${supplier.name}"; Θα διαγραφούν και τα προϊόντα του.`)) return;
    await deleteSupplier(supplier.id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Προμηθευτές</h1>
        <Button onClick={openAddForm}>+ Νέος Προμηθευτής</Button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Δεν έχεις προσθέσει ακόμα προμηθευτές.</p>
          <Button onClick={openAddForm} className="mt-4">
            Προσθήκη πρώτου προμηθευτή
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => openEditForm(supplier)} className="text-gray-500 hover:text-emerald-600">
                    Επεξεργασία
                  </button>
                  <button onClick={() => handleDelete(supplier)} className="text-gray-500 hover:text-red-600">
                    Διαγραφή
                  </button>
                </div>
              </div>
              {supplier.contact_phone && <p className="text-sm text-gray-600 mt-1">📞 {supplier.contact_phone}</p>}
              {supplier.contact_email && <p className="text-sm text-gray-600">✉️ {supplier.contact_email}</p>}
              {supplier.notes && <p className="text-sm text-gray-400 mt-2">{supplier.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Επεξεργασία Προμηθευτή" : "Νέος Προμηθευτής"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Όνομα προμηθευτή"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="π.χ. Οπωροπωλείο Παπαδόπουλος"
            />
            <Input
              label="Τηλέφωνο"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="π.χ. 6912345678"
            />
            <Input
              label="Email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Σημειώσεις</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={2}
              />
            </div>
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
