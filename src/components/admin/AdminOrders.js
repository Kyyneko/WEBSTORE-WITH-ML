import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTracking, setEditTracking] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchOrders(); }, []);
  
  const fetchOrders = () => { 
    axios.get("http://localhost:5000/api/orders", { headers })
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(console.error); 
  };

  const handleDelete = (id) => {
    Swal.fire({ title: "Delete order?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: "#1e293b", color: "#f1f5f9" }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/orders/${id}`, { headers }).then(() => { fetchOrders(); Swal.fire({ toast: true, position: "top-end", title: "Deleted!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); });
    });
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditStatus(order.order_status);
    setEditTracking(order.tracking_number || "");
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${editingOrder.order_id}`, {
        order_status: editStatus,
        tracking_number: editTracking
      }, { headers });
      
      setEditingOrder(null);
      fetchOrders();
      Swal.fire({ toast: true, position: "top-end", title: "Updated!", text: "Order status updated successfully", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ title: "Error", text: "Failed to update order", icon: "error", background: "#1e293b", color: "#f1f5f9" });
    }
  };

  const getStatusStyle = (s) => { s = s?.toLowerCase(); return s === "delivered" ? "badge-success" : s === "shipped" || s === "processing" ? "badge-warning" : s === "cancelled" ? "badge-danger" : "badge-primary"; };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="font-display text-3xl font-bold text-white">Orders</h1><p className="text-surface-400">{orders.length} orders</p></div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "User ID", "Status", "Date", "Amount", "Tracking", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>{orders.map(o => (
            <tr key={o.order_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
              <td className="py-3 px-4 text-surface-300">{o.order_id}</td>
              <td className="py-3 px-4 text-white">{o.user_id}</td>
              <td className="py-3 px-4"><span className={getStatusStyle(o.order_status)}>{o.order_status}</span></td>
              <td className="py-3 px-4 text-surface-300">{o.order_date}</td>
              <td className="py-3 px-4 text-primary-400 font-medium">{Number(o.amount).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
              <td className="py-3 px-4 font-mono text-xs text-surface-300">{o.tracking_number || "-"}</td>
              <td className="py-3 px-4 flex gap-2">
                <button onClick={() => openEditModal(o)} className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm hover:bg-primary-500/30">Edit</button>
                <button onClick={() => handleDelete(o.order_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Del</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {editingOrder && (
        <div className="modal-overlay" onClick={() => setEditingOrder(null)}>
          <div className="modal-content !max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-6">Update Order #{editingOrder.order_id}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">Order Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input-field">
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-300 mb-2">Tracking Number</label>
              <input 
                type="text" 
                value={editTracking} 
                onChange={(e) => setEditTracking(e.target.value)} 
                className="input-field font-mono"
                placeholder="e.g. JNE-123456789"
              />
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={handleUpdate}>Save Changes</button>
              <button className="btn-ghost" onClick={() => setEditingOrder(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
