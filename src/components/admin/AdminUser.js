import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function AdminUser() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");
  const getToken = () => localStorage.getItem("token");

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = () => {
    axios.get("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => setUsers(r.data)).catch(console.error);
  };

  const handleUpdate = () => {
    axios.put(`http://localhost:5000/api/users/profile/${editUser.user_id}`, editUser, { headers: { Authorization: `Bearer ${getToken()}` } }).then(() => { fetchUsers(); setEditUser(null); Swal.fire({ toast: true, position: "top-end", title: "Updated!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); }).catch(() => Swal.fire({ title: "Error!", icon: "error", background: "#1e293b", color: "#f1f5f9" }));
  };

  const handleDelete = (userId) => {
    Swal.fire({ title: "Delete user?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: "#1e293b", color: "#f1f5f9" }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/users/${userId}`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(() => { fetchUsers(); Swal.fire({ toast: true, position: "top-end", title: "Deleted!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); });
    });
  };

  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div><h1 className="font-display text-3xl font-bold text-white">Users</h1><p className="text-surface-400">{users.length} registered users</p></div>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !w-64" />
      </div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "Username", "Email", "First Name", "Last Name", "Role", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.user_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
                <td className="py-3 px-4 text-surface-300">{user.user_id}</td>
                <td className="py-3 px-4">{editUser?.user_id === user.user_id ? <input type="text" value={editUser.username} onChange={e => setEditUser({ ...editUser, username: e.target.value })} className="input-field !py-1 !text-sm" /> : <span className="text-white font-medium">{user.username}</span>}</td>
                <td className="py-3 px-4 text-surface-300">{user.email}</td>
                <td className="py-3 px-4">{editUser?.user_id === user.user_id ? <input type="text" value={editUser.first_name} onChange={e => setEditUser({ ...editUser, first_name: e.target.value })} className="input-field !py-1 !text-sm" /> : <span className="text-surface-300">{user.first_name}</span>}</td>
                <td className="py-3 px-4">{editUser?.user_id === user.user_id ? <input type="text" value={editUser.last_name} onChange={e => setEditUser({ ...editUser, last_name: e.target.value })} className="input-field !py-1 !text-sm" /> : <span className="text-surface-300">{user.last_name}</span>}</td>
                <td className="py-3 px-4"><span className={user.role === "Admin" ? "badge-accent" : "badge-primary"}>{user.role}</span></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {editUser?.user_id === user.user_id ? (
                      <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-success-500/20 text-success-400 text-sm hover:bg-success-500/30">Save</button>
                    ) : (
                      <button onClick={() => setEditUser(user)} className="px-3 py-1 rounded-lg bg-warning-500/20 text-warning-400 text-sm hover:bg-warning-500/30">Edit</button>
                    )}
                    <button onClick={() => handleDelete(user.user_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminUser;
