import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Product() {
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const navigate = useNavigate();
  const itemsPerPage = 8;
  const token = localStorage.getItem("token");
  const id_user = localStorage.getItem("user_id");
  const categories = ["All", "Sport", "Casual", "Boots", "Heels", "Formal"];
  const categoryMap = { Sport: 1, Casual: 2, Boots: 3, Heels: 4, Formal: 5 };

  useEffect(() => { fetchShoes(); }, []);
  useEffect(() => {
    if (selectedCategory === "All") setFilteredShoes(shoes);
    else setFilteredShoes(shoes.filter((s) => s.category_id === categoryMap[selectedCategory]));
    setCurrentPage(1);
  }, [selectedCategory, shoes]);

  const fetchShoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/shoes", { headers: { Authorization: `Bearer ${token}` } });
      setShoes(response.data.sort(() => Math.random() - 0.5));
    } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
  };

  const getCategoryName = (id) => ({ 1: "Sport", 2: "Casual", 3: "Boots", 4: "Heels", 5: "Formal" }[id] || "Other");

  const currentShoes = filteredShoes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredShoes.length / itemsPerPage);

  const addToCart = async (shoeId, quantity, size = "", color = "") => {
    if (!size || !color) {
      Swal.fire("Select Options", "Please select size and color first", "warning");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/cart", { shoe_detail_id: shoeId, id_user, quantity, selected_size: size, selected_color: color }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: "top-end", title: "Added!", text: response.data.message, icon: "success", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Failed to add item to cart", icon: "error", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#ef4444" });
    }
  };

  const handleShoeClick = async (shoeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shoes/${shoeId}`, { headers: { Authorization: `Bearer ${token}` } });
      const shoeData = response.data;
      setSelectedShoe(shoeData);
      
      const sizes = Object.keys(shoeData.sizes_stock || {}).filter(s => shoeData.sizes_stock[s] > 0);
      setSelectedSize(sizes.length > 0 ? sizes[0] : "");
      
      const colors = shoeData.colors ? shoeData.colors.split(", ") : [];
      setSelectedColor(colors.length > 0 ? colors[0] : "");
      
      setShowModal(true);
    } catch (error) { console.error("Error:", error); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="font-display text-3xl font-bold text-white mb-2">All Products</h2>
        <p className="text-surface-400">Discover our premium collection</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow" : "glass-light text-surface-300 hover:text-white hover:bg-surface-700"}`}>{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentShoes.map((shoe, idx) => (
          <div key={shoe.shoe_detail_id} className="glass-card p-4 cursor-pointer group" style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => handleShoeClick(shoe.shoe_detail_id)}>
            <div className="relative overflow-hidden rounded-xl mb-4">
              <img src={`/images/${shoe.shoe_name}.jpg`} alt={shoe.shoe_name} className="w-full h-48 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
              <span className="absolute top-3 left-3 badge-primary">{getCategoryName(shoe.category_id)}</span>
              <button onClick={(e) => { e.stopPropagation(); handleShoeClick(shoe.shoe_detail_id); }} className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary-400 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
            <h3 className="text-sm font-semibold text-white truncate">{shoe.shoe_name}</h3>
            <p className="text-primary-400 font-bold mt-1">{shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
            <p className="text-surface-500 text-xs mt-1">{shoe.stock > 0 ? `${shoe.stock} in stock` : "Out of stock"}</p>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="btn-ghost disabled:opacity-30">← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage === i + 1 ? "bg-primary-500 text-white shadow-glow" : "glass-light text-surface-400 hover:text-white"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="btn-ghost disabled:opacity-30">Next →</button>
        </div>
      )}
      {showModal && selectedShoe && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={`/images/${selectedShoe.shoe_name}.jpg`} alt={selectedShoe.shoe_name} className="w-full h-64 object-cover rounded-xl mb-4" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
            <span className="badge-primary mb-2">{getCategoryName(selectedShoe.category_id)}</span>
            <h3 className="text-2xl font-bold text-white mt-2">{selectedShoe.shoe_name}</h3>
            <p className="text-primary-400 text-xl font-bold mt-2">{selectedShoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
            <p className="text-surface-400 text-sm mt-3 leading-relaxed">{selectedShoe.description}</p>
            
            <div className="mt-4">
              <label className="text-surface-300 text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {(selectedShoe.colors ? selectedShoe.colors.split(", ") : []).map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedColor === c ? 'border-primary-500 text-primary-400 bg-primary-500/10' : 'border-surface-700 text-surface-400 hover:border-surface-500'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-surface-300 text-sm font-medium mb-2 flex justify-between">
                <span>Size</span>
                {selectedSize && <span className="text-surface-500 font-normal">Stock: {selectedShoe.sizes_stock[selectedSize]}</span>}
              </label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(selectedShoe.sizes_stock || {}).map(s => {
                  const outOfStock = selectedShoe.sizes_stock[s] < 1;
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
                disabled={!selectedSize || !selectedColor || selectedShoe.sizes_stock[selectedSize] < 1}
                onClick={() => {
                  localStorage.setItem("temp_checkout_size", selectedSize);
                  localStorage.setItem("temp_checkout_color", selectedColor);
                  navigate(`/checkout/${selectedShoe.shoe_detail_id}`);
                }}>Buy Now</button>
              <button 
                className="btn-outline flex-1 disabled:opacity-50" 
                disabled={!selectedSize || !selectedColor || selectedShoe.sizes_stock[selectedSize] < 1}
                onClick={() => { addToCart(selectedShoe.shoe_detail_id, 1, selectedSize, selectedColor); setShowModal(false); }}>Add to Cart</button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Product;
