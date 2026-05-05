import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function AdminSepatuDetail() {
  const navigate = useNavigate();
  const [shoes, setShoes] = useState([]);
  const [newShoe, setNewShoe] = useState({ category_id: '', shoe_name: '', shoe_price: '', shoe_size: '', stock: '' });
  const [editShoe, setEditShoe] = useState(null);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchShoes(); }, []);
  const fetchShoes = () => { axios.get('http://localhost:5000/api/shoes', { headers }).then(r => setShoes(Array.isArray(r.data) ? r.data : [])).catch(console.error); };
  const handleCreate = () => {
    axios.post('http://localhost:5000/api/shoes', newShoe, { headers }).then(() => { fetchShoes(); setNewShoe({ category_id: '', shoe_name: '', shoe_price: '', shoe_size: '', stock: '' }); Swal.fire({ toast: true, position: "top-end", title: 'Created!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); }).catch(() => Swal.fire({ title: 'Error!', icon: 'error', background: '#1e293b', color: '#f1f5f9' }));
  };
  const handleUpdate = () => {
    axios.put(`http://localhost:5000/api/shoes/${editShoe.shoe_detail_id}`, editShoe, { headers }).then(() => { fetchShoes(); setEditShoe(null); Swal.fire({ toast: true, position: "top-end", title: 'Updated!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); }).catch(console.error);
  };
  const handleDelete = (id) => {
    Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#1e293b', color: '#f1f5f9' }).then(r => {
      if (r.isConfirmed) axios.delete(`http://localhost:5000/api/shoes/${id}`, { headers }).then(() => { fetchShoes(); Swal.fire({ toast: true, position: "top-end", title: 'Deleted!', icon: 'success', background: '#1e293b', color: '#f1f5f9', timer: 1200, showConfirmButton: false }); });
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="font-display text-3xl font-bold text-white">Manage Shoes</h1><p className="text-surface-400">{shoes.length} products</p></div>
        <button onClick={() => navigate('/admin')} className="btn-ghost border border-surface-600">← Back</button>
      </div>
      <div className="glass-card p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Add New Shoe</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.keys(newShoe).map(k => (<input key={k} type="text" placeholder={k.replace('_', ' ')} value={newShoe[k]} onChange={e => setNewShoe({ ...newShoe, [k]: e.target.value })} className="input-field" />))}
        </div>
        <button onClick={handleCreate} className="btn-primary mt-4">Add Shoe</button>
      </div>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-surface-700">{["ID", "Name", "Price", "Size", "Stock", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-surface-400 text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>{shoes.map(shoe => (
            <tr key={shoe.shoe_detail_id} className="border-b border-surface-800 hover:bg-surface-800/50 transition-colors">
              <td className="py-3 px-4 text-surface-300">{shoe.shoe_detail_id}</td>
              <td className="py-3 px-4">{editShoe?.shoe_detail_id === shoe.shoe_detail_id ? <input type="text" value={editShoe.shoe_name} onChange={e => setEditShoe({ ...editShoe, shoe_name: e.target.value })} className="input-field !py-1 !text-sm" /> : <span className="text-white">{shoe.shoe_name}</span>}</td>
              <td className="py-3 px-4">{editShoe?.shoe_detail_id === shoe.shoe_detail_id ? <input type="text" value={editShoe.shoe_price} onChange={e => setEditShoe({ ...editShoe, shoe_price: e.target.value })} className="input-field !py-1 !text-sm w-28" /> : <span className="text-primary-400">{Number(shoe.shoe_price).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>}</td>
              <td className="py-3 px-4">{editShoe?.shoe_detail_id === shoe.shoe_detail_id ? <input type="text" value={editShoe.shoe_size} onChange={e => setEditShoe({ ...editShoe, shoe_size: e.target.value })} className="input-field !py-1 !text-sm w-16" /> : <span className="text-surface-300">{shoe.shoe_size}</span>}</td>
              <td className="py-3 px-4">{editShoe?.shoe_detail_id === shoe.shoe_detail_id ? <input type="text" value={editShoe.stock} onChange={e => setEditShoe({ ...editShoe, stock: e.target.value })} className="input-field !py-1 !text-sm w-16" /> : <span className={shoe.stock > 10 ? "badge-success" : shoe.stock > 0 ? "badge-warning" : "badge-danger"}>{shoe.stock}</span>}</td>
              <td className="py-3 px-4"><div className="flex gap-2">{editShoe?.shoe_detail_id === shoe.shoe_detail_id ? <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-success-500/20 text-success-400 text-sm hover:bg-success-500/30">Save</button> : <button onClick={() => setEditShoe(shoe)} className="px-3 py-1 rounded-lg bg-warning-500/20 text-warning-400 text-sm hover:bg-warning-500/30">Edit</button>}<button onClick={() => handleDelete(shoe.shoe_detail_id)} className="px-3 py-1 rounded-lg bg-danger-500/20 text-danger-400 text-sm hover:bg-danger-500/30">Delete</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminSepatuDetail;
