import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminInteractions() {
  const [interactions, setInteractions] = useState([]);
  const [stats, setStats] = useState({ view: 0, wishlist: 0, cart: 0, order: 0 });
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchInteractions(); }, []);
  const fetchInteractions = () => {
    axios.get("http://localhost:5000/api/user_interactions", { headers }).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setInteractions(data);
      setStats({ view: data.filter(i => i.interaction_type === "view").length, wishlist: data.filter(i => i.interaction_type === "wishlist").length, cart: data.filter(i => i.interaction_type === "cart").length, order: data.filter(i => i.interaction_type === "order").length });
    }).catch(console.error);
  };
  const handleDelete = (id) => {
    Swal.fire({ title: "Delete?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: "#1e293b", color: "#f1f5f9" }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/user_interactions/${id}`, { headers }).then(() => { fetchInteractions(); Swal.fire({ toast: true, position: "top-end", title: "Deleted!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); });
    });
  };
  const getTypeStyle = (t) => ({ view: "badge bg-blue-500/20 text-blue-400", wishlist: "badge bg-pink-500/20 text-pink-400", cart: "badge bg-yellow-500/20 text-yellow-400", order: "badge bg-green-500/20 text-green-400" }[t] || "badge-primary");

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="font-display text-3xl font-bold text-white">User Interactions</h1><p className="text-surface-400">{interactions.length} total interactions</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[["Views", stats.view, "👁️", "from-blue-500 to-blue-600"], ["Wishlists", stats.wishlist, "💜", "from-pink-500 to-pink-600"], ["Cart Adds", stats.cart, "🛒", "from-yellow-500 to-yellow-600"], ["Orders", stats.order, "✅", "from-green-500 to-green-600"]].map(([label, val, icon, gradient]) => (
          <div key={label} className="glass-card p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg`}>{icon}</div><div><p className="text-surface-400 text-xs">{label}</p><p className="text-white text-xl font-bold">{val}</p></div></div></div>
        ))}
      </div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "User ID", "Shoe ID", "Type", "Date", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>{interactions.slice(0, 100).map(i => (
            <tr key={i.interaction_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
              <td className="py-3 px-4 text-surface-300">{i.interaction_id}</td>
              <td className="py-3 px-4 text-white">{i.id_user}</td>
              <td className="py-3 px-4 text-surface-300">{i.shoe_detail_id}</td>
              <td className="py-3 px-4"><span className={getTypeStyle(i.interaction_type)}>{i.interaction_type}</span></td>
              <td className="py-3 px-4 text-surface-300 text-sm">{i.interaction_date}</td>
              <td className="py-3 px-4"><button onClick={() => handleDelete(i.interaction_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
        {interactions.length > 100 && <p className="text-surface-500 text-sm text-center mt-4">Showing first 100 of {interactions.length} interactions</p>}
      </div>
    </div>
  );
}
export default AdminInteractions;
