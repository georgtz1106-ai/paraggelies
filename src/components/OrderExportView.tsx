import { useState } from "react";
import { buildSupplierText, formatDateGreek, groupItemsBySupplier, toWhatsAppLink, type OrderItemView } from "../lib/orderText";
import { Button } from "./Button";

interface OrderExportViewProps {
  title: string;
  createdAt: string;
  items: OrderItemView[];
  primaryAction: { label: string; onClick: () => void };
}

export function OrderExportView({ title, createdAt, items, primaryAction }: OrderExportViewProps) {
  const groups = groupItemsBySupplier(items);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(supplierId: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(supplierId);
    setTimeout(() => setCopiedId((current) => (current === supplierId ? null : current)), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{formatDateGreek(createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            Εκτύπωση / PDF
          </Button>
          <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        </div>
      </div>

      <h2 className="hidden print:block text-lg font-semibold mb-4">Παραγγελία {formatDateGreek(createdAt)}</h2>

      <div className="flex flex-col gap-4">
        {groups.map((groupItems) => {
          const supplier = groupItems[0];
          const text = buildSupplierText(groupItems, createdAt);
          return (
            <div key={supplier.supplier_id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2 print:hidden">
                <h3 className="font-medium text-gray-900">{supplier.supplier_name}</h3>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => handleCopy(supplier.supplier_id, text)}
                    className="text-gray-500 hover:text-emerald-600"
                  >
                    {copiedId === supplier.supplier_id ? "Αντιγράφηκε!" : "Αντιγραφή"}
                  </button>
                  <a
                    href={toWhatsAppLink(supplier.supplier_phone, text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-emerald-600"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{text}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
