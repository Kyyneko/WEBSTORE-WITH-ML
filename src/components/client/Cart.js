import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId && token) fetchCart();
  }, [userId, token]);

  const fetchCart = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/cart/${userId}`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCartItems(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateCartItem = async (id, shoeDetailId, qty, size, color) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/cart/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ shoe_detail_id: shoeDetailId, quantity: qty, selected_size: size, selected_color: color })
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire("Error", data.message || "Failed to update", "error");
      }
      fetchCart();
    } catch (e) { console.error(e); }
  };

  const handleDelete = (id) => {
    Swal.fire({ title: "Remove item?", text: "This item will be removed from your cart.", icon: "warning", showCancelButton: true, confirmButtonText: "Remove", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#ef4444" }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://127.0.0.1:5000/api/cart/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
          .then(() => { setCartItems(cartItems.filter((item) => item.id_cart !== id)); Swal.fire({ toast: true, position: "top-end", title: "Removed!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false }); })
          .catch(console.error);
      }
    });
  };

  const total = cartItems.reduce((sum, item) => sum + item.shoe_price * item.quantity, 0);

  if (loading) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Shopping Cart</h1>
        <p className="text-surface-400">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <p className="text-surface-400 text-lg">Your cart is empty</p>
          <p className="text-surface-500 text-sm mt-1">Start shopping to add items</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={item.id_cart} className="glass-card p-4 flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <img src={`/images/${item.shoe_name}.jpg`} alt={item.shoe_name} className="w-24 h-24 object-cover rounded-xl" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.shoe_name}</h3>
                  <p className="text-surface-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                  <p className="text-primary-400 font-bold mt-2">{item.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div>
                      <label className="text-surface-500 text-xs mr-2">Size</label>
                      <select 
                        value={item.selected_size} 
                        onChange={(e) => updateCartItem(item.id_cart, item.shoe_detail_id, item.quantity, e.target.value, item.selected_color)}
                        className="bg-surface-800 text-sm text-white rounded px-2 py-1 border border-surface-700 focus:outline-none focus:border-primary-500"
                      >
                        {Object.keys(item.sizes_stock || {}).map(s => {
                          const stock = item.sizes_stock[s];
                          if (stock < 1 && s !== item.selected_size) return null;
                          return <option key={s} value={s}>{s} (Stock: {stock})</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-surface-500 text-xs mr-2">Color</label>
                      <select 
                        value={item.selected_color} 
                        onChange={(e) => updateCartItem(item.id_cart, item.shoe_detail_id, item.quantity, item.selected_size, e.target.value)}
                        className="bg-surface-800 text-sm text-white rounded px-2 py-1 border border-surface-700 focus:outline-none focus:border-primary-500"
                      >
                        {(item.colors ? item.colors.split(", ") : []).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-surface-500 text-xs">Qty:</span>
                    <button onClick={() => updateCartItem(item.id_cart, item.shoe_detail_id, Math.max(1, item.quantity - 1), item.selected_size, item.selected_color)} className="w-6 h-6 rounded bg-surface-700 text-white flex items-center justify-center">-</button>
                    <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.id_cart, item.shoe_detail_id, item.quantity + 1, item.selected_size, item.selected_color)} className="w-6 h-6 rounded bg-surface-700 text-white flex items-center justify-center">+</button>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id_cart)} className="self-start text-surface-500 hover:text-danger-400 transition-colors p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="glass-card p-6 h-fit sticky top-24">
            <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-surface-400 text-sm"><span>Subtotal ({cartItems.length} items)</span><span>{total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
              <div className="flex justify-between text-surface-400 text-sm"><span>Shipping</span><span className="text-success-400">Free</span></div>
              <div className="border-t border-surface-700 pt-3 flex justify-between text-white font-bold"><span>Total</span><span className="text-primary-400">{total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span></div>
            </div>
            <button className="btn-primary w-full">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Cart;
