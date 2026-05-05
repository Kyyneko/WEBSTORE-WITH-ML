import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPayments(); }, []);
  const fetchPayments = () => { axios.get("http://localhost:5000/api/payments", { headers }).then(r => setPayments(Array.isArray(r.data) ? r.data : [])).catch(console.error); };
  const handleDelete = (id) => {
    Swal.fire({ title: "Delete payment?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: "#1e293b", color: "#f1f5f9" }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/payments/${id}`, { headers }).then(() => { fetchPayments(); Swal.fire({ toast: true, position: "top-end", title: "Deleted!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); });
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="font-display text-3xl font-bold text-white">Payments</h1><p className="text-surface-400">{payments.length} payments</p></div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "Order ID", "Method", "Status", "Date", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>{payments.map(p => (
            <tr key={p.payment_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
              <td className="py-3 px-4 text-surface-300">{p.payment_id}</td>
              <td className="py-3 px-4 text-white">{p.order_id}</td>
              <td className="py-3 px-4 text-surface-300">{p.payment_method}</td>
              <td className="py-3 px-4"><span className={p.payment_status === "Completed" ? "badge-success" : p.payment_status === "Pending" ? "badge-warning" : "badge-primary"}>{p.payment_status}</span></td>
              <td className="py-3 px-4 text-surface-300">{p.payment_date}</td>
              <td className="py-3 px-4"><button onClick={() => handleDelete(p.payment_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminPayments;
