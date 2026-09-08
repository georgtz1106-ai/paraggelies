import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import type { Order } from "../types/database";
import type { OrderItemView } from "../lib/orderText";
import { OrderExportView } from "../components/OrderExportView";

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(id).then((result) => {
      setOrder(result.order);
      setItems(result.items);
      setError(result.error);
      setLoading(false);
    });
  }, [id]);

  function handleReorder() {
    navigate("/orders/new", {
      state: { prefill: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })) },
    });
  }

  if (loading) return <p className="text-gray-500 text-sm">Φόρτωση...</p>;
  if (error || !order) return <p className="text-sm text-red-600">{error ?? "Δεν βρέθηκε η παραγγελία."}</p>;

  return (
    <OrderExportView
      title={`Παραγγελία ${new Date(order.created_at).toLocaleDateString("el-GR")}`}
      createdAt={order.created_at}
      items={items}
      primaryAction={{ label: "Ξαναπαράγγειλε ίδια", onClick: handleReorder }}
    />
  );
}
