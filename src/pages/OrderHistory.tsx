import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRestaurant } from "../hooks/useRestaurant";
import { useOrders, type OrderSummary } from "../hooks/useOrders";
import { formatDateGreek } from "../lib/orderText";
import { Button } from "../components/Button";

export function OrderHistory() {
  const { restaurant } = useRestaurant();
  const { listOrders } = useOrders();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurant) return;
    setLoading(true);
    listOrders(restaurant.id).then(({ orders, error }) => {
      setOrders(orders);
      setError(error);
      setLoading(false);
    });
  }, [restaurant]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Ιστορικό Παραγγελιών</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Φόρτωση...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Δεν έχεις κάνει ακόμα καμία παραγγελία.</p>
          <Link to="/orders/new">
            <Button className="mt-4">Δημιουργία πρώτης παραγγελίας</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl border border-gray-200">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">{formatDateGreek(order.created_at)}</span>
              <span className="text-sm text-gray-500">{order.item_count} προϊόντα</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
