import React, { useState, useEffect } from "react";
import axios from "axios";

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => { if (userId && token) fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(response.data);
    } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return "badge-success";
    if (s === "shipped" || s === "processing") return "badge-warning";
    if (s === "cancelled") return "badge-danger";
    return "badge-primary";
  };

  if (loading) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="font-display text-3xl font-bold text-white mb-2">My Orders</h2>
        <p className="text-surface-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <p className="text-surface-400 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order, idx) => (
            <div key={order.order_id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-surface-500 text-xs">Order #{order.order_id}</p>
                  <h3 className="text-white font-semibold mt-1">{order.shoe_name}</h3>
                  <div className="flex gap-2 text-surface-400 text-xs mt-2">
                    {order.selected_size && <span className="bg-surface-800 px-2 py-0.5 rounded border border-surface-700">Size: {order.selected_size}</span>}
                    {order.selected_color && <span className="bg-surface-800 px-2 py-0.5 rounded border border-surface-700">Color: {order.selected_color}</span>}
                  </div>
                </div>
                <span className={getStatusStyle(order.order_status)}>{order.order_status}</span>
              </div>
              <img src={`/images/${order.shoe_name}.jpg`} alt={order.shoe_name} className="w-full h-40 object-cover rounded-xl mb-4" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
              <div className="bg-surface-800/50 rounded-xl p-3 mb-4 text-sm border border-surface-700">
                <div className="flex justify-between items-center border-b border-surface-700 pb-2 mb-2">
                  <span className="text-surface-400">Tracking:</span>
                  <span className="font-mono text-white tracking-wider bg-surface-900 px-2 py-1 rounded">
                    {order.tracking_number || "Not yet shipped"}
                  </span>
                </div>
                <div className="text-surface-300">
                  <p className="text-surface-500 mb-1">Shipping to:</p>
                  <p className="line-clamp-2">{order.shipping_address || "No address provided"}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-surface-400 text-sm">{new Date(order.order_date).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
                <p className="text-primary-400 font-bold">{order.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default OrderPage;
