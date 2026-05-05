import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminWishlists() {
  const [wishlists, setWishlists] = useState([]);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchWishlists(); }, []);
  const fetchWishlists = () => { axios.get("http://localhost:5000/api/wishlist", { headers }).then(r => setWishlists(Array.isArray(r.data) ? r.data : [])).catch(console.error); };
  const handleDelete = (id) => {
    Swal.fire({ title: "Remove?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: "#1e293b", color: "#f1f5f9" }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/wishlist/${id}`, { headers }).then(() => { fetchWishlists(); Swal.fire({ toast: true, position: "top-end", title: "Removed!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); });
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="font-display text-3xl font-bold text-white">Wishlists</h1><p className="text-surface-400">{wishlists.length} items</p></div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "User ID", "Shoe ID", "Date Added", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>{wishlists.map(w => (
            <tr key={w.id_wishlist} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
              <td className="py-3 px-4 text-surface-300">{w.id_wishlist}</td>
              <td className="py-3 px-4 text-white">{w.id_user}</td>
              <td className="py-3 px-4 text-surface-300">{w.shoe_detail_id}</td>
              <td className="py-3 px-4 text-surface-300">{w.date_added}</td>
              <td className="py-3 px-4"><button onClick={() => handleDelete(w.id_wishlist)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminWishlists;
