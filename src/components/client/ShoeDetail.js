import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function ShoeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shoe, setShoe] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/shoes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setShoe(r.data))
      .catch(() => setError("Error loading shoe details."));
  }, [id, token]);

  const addToCart = async () => {
    try {
      await axios.post("http://localhost:5000/api/cart", { id_user: userId, shoe_detail_id: shoe.shoe_detail_id, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ toast: true, position: "top-end", title: "Added to Cart!", icon: "success", background: "#1e293b", color: "#f1f5f9", timer: 1500, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ title: "Error", text: "Could not add to cart.", icon: "error", background: "#1e293b", color: "#f1f5f9" });
    }
  };

  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-danger-400">{error}</div>;
  if (!shoe) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div></div>);

  const getCat = (id) => ({ 1: "Sport", 2: "Casual", 3: "Boots", 4: "Heels", 5: "Formal" }[id] || "Other");

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="glass-card p-6 sm:p-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <img src={`/images/${shoe.shoe_name}.jpg`} alt={shoe.shoe_name} className="w-full h-80 object-cover rounded-2xl" onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }} />
          <div className="flex flex-col justify-center">
            <span className="badge-primary mb-3 w-fit">{getCat(shoe.category_id)}</span>
            <h1 className="font-display text-3xl font-bold text-white">{shoe.shoe_name}</h1>
            <p className="text-primary-400 text-2xl font-bold mt-3">{shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
            <div className="flex gap-4 mt-4 text-surface-400"><span>Size: {shoe.shoe_size}</span><span>Stock: {shoe.stock}</span></div>
            <div className="flex gap-3 mt-8">
              <button onClick={addToCart} className="btn-primary flex-1">Add to Cart</button>
              <button onClick={() => navigate(-1)} className="btn-outline">Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ShoeDetail;
