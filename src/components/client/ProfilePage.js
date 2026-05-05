import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", first_name: "", last_name: "", address: "", phone: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    setUserId(uid);
    if (uid && token) {
      axios.get(`http://localhost:5000/api/users/${uid}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => { setFormData({ username: r.data.username || "", email: r.data.email || "", first_name: r.data.first_name || "", last_name: r.data.last_name || "", address: r.data.address || "", phone: r.data.phone || "" }); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/profile/${userId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: "top-end", title: "Updated!", text: "Profile saved successfully.", icon: "success", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1" });
      setEditMode(false);
    } catch (error) {
      Swal.fire({ title: "Error", text: "Failed to update profile.", icon: "error", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#ef4444" });
    }
  };

  if (loading) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>);

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-glow">{formData.username?.charAt(0)?.toUpperCase() || "U"}</div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{formData.first_name} {formData.last_name}</h1>
            <p className="text-surface-400">@{formData.username}</p>
          </div>
        </div>
        {editMode ? (
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-surface-300 mb-2">First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-surface-300 mb-2">Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" /></div>
            </div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Username</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-surface-300 mb-2">Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-ghost flex-1 border border-surface-600">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {[["Email", formData.email, "📧"], ["Address", formData.address || "Not set", "📍"], ["Phone", formData.phone || "Not set", "📱"]].map(([label, value, icon]) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50">
                <span className="text-xl">{icon}</span>
                <div><p className="text-surface-500 text-xs">{label}</p><p className="text-white font-medium">{value}</p></div>
              </div>
            ))}
            <button onClick={() => setEditMode(true)} className="btn-primary w-full mt-4">Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;
