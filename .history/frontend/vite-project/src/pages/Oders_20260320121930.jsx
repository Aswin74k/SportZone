import { useEffect, useState } from "react";
import API from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("orders/")
      .then((res) => setOrders(res.data))
      .catch(() => console.log("Error fetching orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No Orders Yet 📦</h2>
        <p className="text-muted">Start shopping now</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="card mb-4 shadow-sm border-0 rounded-4 p-3"
        >
          <div className="d-flex justify-content-between mb-2">
            <h5>Order #{order.id}</h5>
            <span className="badge bg-primary">
              {order.status}
            </span>
          </div>

          <p className="text-muted small">
            Date: {new Date(order.created_at).toLocaleDateString()}
          </p>

          <p className="fw-bold">
            Total: ₹{order.total_price}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Orders;