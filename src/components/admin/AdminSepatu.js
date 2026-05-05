import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AdminSepatu() {
  const [categories, setCategories] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [stats, setStats] = useState({ totalShoes: 0, totalCategories: 0, totalStock: 0 });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchCategories(); fetchShoes(); }, []);

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories').then(r => { setCategories(r.data); setStats(s => ({ ...s, totalCategories: r.data.length })); }).catch(console.error);
  };
  const fetchShoes = () => {
    axios.get('http://localhost:5000/api/shoes', { headers }).then(r => {
      if (Array.isArray(r.data)) { setShoes(r.data); setStats(s => ({ ...s, totalShoes: r.data.length, totalStock: r.data.reduce((a, b) => a + b.stock, 0) })); }
    }).catch(console.error);
  };

  const handleCreate = () => {
    if (!newCategory.trim()) return;
    axios.post('http://localhost:5000/api/categories', { category_name: newCategory }, { headers }).then(() => { fetchCategories(); setNewCategory(''); Swal.fire({ toast: true, position: "top-end", title: 'Created!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); }).catch(() => Swal.fire({ title: 'Error!', icon: 'error', background: '#1e293b', color: '#f1f5f9' }));
  };
  const handleUpdate = () => {
    axios.put(`http://localhost:5000/api/categories/${editCategory.category_id}`, { category_name: editCategory.category_name }, { headers }).then(() => { fetchCategories(); setEditCategory(null); Swal.fire({ toast: true, position: "top-end", title: 'Updated!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); }).catch(console.error);
  };
  const handleDelete = (id) => {
    Swal.fire({ title: 'Delete?', text: "This can't be undone!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#1e293b', color: '#f1f5f9' }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/categories/${id}`, { headers }).then(() => { fetchCategories(); Swal.fire({ toast: true, position: "top-end", title: 'Deleted!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); });
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-surface-400">Manage categories and products</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[["Total Products", stats.totalShoes, "📦", "from-primary-500 to-primary-600"], ["Categories", stats.totalCategories, "📂", "from-accent-500 to-accent-600"], ["Total Stock", stats.totalStock, "📊", "from-success-500 to-success-600"]].map(([label, val, icon, gradient]) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl`}>{icon}</div>
              <div><p className="text-surface-400 text-sm">{label}</p><p className="text-white text-2xl font-bold">{val}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {['categories', 'products'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'bg-primary-500 text-white' : 'glass-light text-surface-400 hover:text-white'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {activeTab === 'categories' && (
        <div className="glass-card p-6">
          <div className="flex gap-3 mb-6">
            <input type="text" placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} className="btn-primary !px-8">Add</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-surface-700"><th className="text-left py-3 px-4 text-surface-400 text-sm font-medium">ID</th><th className="text-left py-3 px-4 text-surface-400 text-sm font-medium">Name</th><th className="text-right py-3 px-4 text-surface-400 text-sm font-medium">Actions</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.category_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4 text-surface-300">{cat.category_id}</td>
                    <td className="py-3 px-4">
                      {editCategory?.category_id === cat.category_id ? (
                        <input type="text" value={editCategory.category_name} onChange={(e) => setEditCategory({ ...editCategory, category_name: e.target.value })} className="input-field !py-1" onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} autoFocus />
                      ) : <span className="text-white">{cat.category_name}</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editCategory?.category_id === cat.category_id ? (
                          <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-success-500/20 text-success-400 text-sm hover:bg-success-500/30 transition-colors">Save</button>
                        ) : (
                          <button onClick={() => setEditCategory(cat)} className="px-3 py-1 rounded-lg bg-warning-500/20 text-warning-400 text-sm hover:bg-warning-500/30 transition-colors">Edit</button>
                        )}
                        <button onClick={() => handleDelete(cat.category_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'products' && (
        <div className="glass-card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-surface-700"><th className="text-left py-3 px-4 text-surface-400 text-sm">ID</th><th className="text-left py-3 px-4 text-surface-400 text-sm">Name</th><th className="text-left py-3 px-4 text-surface-400 text-sm">Price</th><th className="text-left py-3 px-4 text-surface-400 text-sm">Size</th><th className="text-left py-3 px-4 text-surface-400 text-sm">Stock</th></tr></thead>
              <tbody>
                {shoes.map(shoe => (
                  <tr key={shoe.shoe_detail_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4 text-surface-300">{shoe.shoe_detail_id}</td>
                    <td className="py-3 px-4 text-white">{shoe.shoe_name}</td>
                    <td className="py-3 px-4 text-primary-400">{shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                    <td className="py-3 px-4 text-surface-300">{shoe.shoe_size}</td>
                    <td className="py-3 px-4"><span className={shoe.stock > 10 ? "badge-success" : shoe.stock > 0 ? "badge-warning" : "badge-danger"}>{shoe.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminSepatu;
