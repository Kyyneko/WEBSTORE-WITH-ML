import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Recomended() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const id_user = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id_user) { setError("User not found"); setLoading(false); return; }
    const init = async () => {
      try { await axios.post("http://localhost:5000/api/train_recommendation", {}, { headers: { Authorization: `Bearer ${token}` } }); } catch (e) { console.error("Training error:", e); }
      try {
        const response = await axios.get(`http://localhost:5000/api/shoe_recommendations/${id_user}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data && response.data.length > 0) {
          setProducts(response.data.map((r) => ({ id: r.shoe_detail_id, shoeName: r.shoe_name, shoePrice: r.shoe_price, shoeSize: r.shoe_size, stock: r.stock, categoryId: r.category_id })));
        } else { setError("No recommendations yet. Browse some products first!"); }
      } catch (e) { setError("No recommendations available yet."); }
      setLoading(false);
    };
    init();
  }, [id_user, token]);

  const addToCart = async (shoeId, size, color) => {
    if (!size || !color) {
      Swal.fire("Select Options", "Please select size and color", "warning");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/cart", { shoe_detail_id: shoeId, id_user, quantity: 1, selected_size: size, selected_color: color }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: "top-end", title: "Added!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1200, showConfirmButton: false });
    } catch (e) { Swal.fire({ title: "Error", text: e.response?.data?.message || "Failed to add", icon: "error", background: "#1e293b", color: "#f1f5f9" }); }
  };
  
  const handleProductClick = async (product) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shoes/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const shoeData = response.data;
      setSelectedProduct({...product, ...shoeData});
      
      const sizes = Object.keys(shoeData.sizes_stock || {}).filter(s => shoeData.sizes_stock[s] > 0);
      setSelectedSize(sizes.length > 0 ? sizes[0] : "");
      
      const colors = shoeData.colors ? shoeData.colors.split(", ") : [];
      setSelectedColor(colors.length > 0 ? colors[0] : "");
      
      setShowModal(true);
    } catch (error) { console.error("Error:", error); }
  };

  if (loading) return (<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div><p className="text-surface-400">Training AI model & loading recommendations...</p></div>);
  if (error) return (<div className="min-h-[40vh] flex flex-col items-center justify-center"><div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 10 14.5V17"/></svg></div><p className="text-surface-400 text-lg">{error}</p></div>);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <span className="badge-primary mb-3 inline-block">🤖 AI-Powered</span>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Recommended For You</h1>
        <p className="text-surface-400">Curated picks based on your browsing history</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <div key={product.id} className="glass-card p-4 cursor-pointer group animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }} onClick={() => handleProductClick(product)}>
            <div className="relative overflow-hidden rounded-xl mb-4">
              <img src={`/images/${product.shoeName}.jpg`} alt={product.shoeName} className="w-full h-48 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
              <div className="absolute top-3 left-3"><span className="badge bg-accent-500/20 text-accent-400 text-xs">✨ For You</span></div>
            </div>
            <h3 className="text-sm font-semibold text-white truncate">{product.shoeName}</h3>
            <p className="text-primary-400 font-bold mt-1">{product.shoePrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
          </div>
        ))}
      </div>
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={`/images/${selectedProduct.shoeName}.jpg`} alt={selectedProduct.shoeName} className="w-full h-64 object-cover rounded-xl mb-4" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
            <h3 className="text-2xl font-bold text-white">{selectedProduct.shoeName}</h3>
            <p className="text-primary-400 text-xl font-bold mt-2">{selectedProduct.shoePrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
            <p className="text-surface-400 text-sm mt-3 leading-relaxed">{selectedProduct.description}</p>
            
            <div className="mt-4">
              <label className="text-surface-300 text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {(selectedProduct.colors ? selectedProduct.colors.split(", ") : []).map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedColor === c ? 'border-primary-500 text-primary-400 bg-primary-500/10' : 'border-surface-700 text-surface-400 hover:border-surface-500'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-surface-300 text-sm font-medium mb-2 flex justify-between">
                <span>Size</span>
                {selectedSize && <span className="text-surface-500 font-normal">Stock: {selectedProduct.sizes_stock?.[selectedSize]}</span>}
              </label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(selectedProduct.sizes_stock || {}).map(s => {
                  const outOfStock = selectedProduct.sizes_stock[s] < 1;
                  return (
                    <button key={s} disabled={outOfStock} onClick={() => setSelectedSize(s)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium border transition-all ${outOfStock ? 'border-surface-800 text-surface-600 bg-surface-800/50 cursor-not-allowed' : selectedSize === s ? 'border-primary-500 text-white bg-primary-500 shadow-glow' : 'border-surface-700 text-surface-300 hover:border-surface-500 bg-surface-800'}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                className="btn-primary flex-1 disabled:opacity-50" 
                disabled={!selectedSize || !selectedColor || selectedProduct.sizes_stock?.[selectedSize] < 1}
                onClick={() => {
                  localStorage.setItem("temp_checkout_size", selectedSize);
                  localStorage.setItem("temp_checkout_color", selectedColor);
                  navigate(`/checkout/${selectedProduct.id}`);
                }}>Buy Now</button>
              <button 
                className="btn-outline flex-1 disabled:opacity-50" 
                disabled={!selectedSize || !selectedColor || selectedProduct.sizes_stock?.[selectedSize] < 1}
                onClick={() => { addToCart(selectedProduct.id, selectedSize, selectedColor); setShowModal(false); }}>Add to Cart</button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Recomended;
