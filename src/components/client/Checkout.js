import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shoe, setShoe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout form state
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchShoeDetail();
    fetchUserProfile();
    
    // Read selections from localStorage if they came from Buy Now
    const tSize = localStorage.getItem("temp_checkout_size");
    const tColor = localStorage.getItem("temp_checkout_color");
    if (tSize) setSelectedSize(tSize);
    if (tColor) setSelectedColor(tColor);
  }, [id]);

  const fetchShoeDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShoe(response.data);
    } catch (error) {
      console.error("Error fetching shoe details:", error);
      Swal.fire({ title: "Error", text: "Product not found", icon: "error", background: "#1e293b", color: "#f1f5f9" });
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.address) {
        setShippingAddress(response.data.address);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      Swal.fire({ title: "Required", text: "Please enter your shipping address", icon: "warning", background: "#1e293b", color: "#f1f5f9" });
      return;
    }

    try {
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we secure your order",
        allowOutsideClick: false,
        background: "#1e293b", color: "#f1f5f9",
        didOpen: () => { Swal.showLoading(); }
      });

      const orderData = {
        shoe_detail_id: shoe.shoe_detail_id,
        order_status: "Pending",
        order_date: new Date().toISOString().split('T')[0],
        amount: shoe.shoe_price,
        shipping_address: shippingAddress,
        selected_size: selectedSize,
        selected_color: selectedColor
      };

      await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: "Order Placed!",
        text: "Your order has been successfully placed. You can track it in My Orders.",
        icon: "success",
        background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1"
      }).then(() => {
        navigate("/orders");
      });

    } catch (error) {
      console.error("Checkout failed:", error);
      Swal.fire({ title: "Error", text: "Failed to place order. Please try again.", icon: "error", background: "#1e293b", color: "#f1f5f9" });
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!shoe) return null;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Checkout</h2>
        <p className="text-surface-400">Complete your purchase details below.</p>
        {(!selectedSize || !selectedColor) && (
          <div className="mt-4 p-3 bg-warning-500/10 border border-warning-500/50 rounded-xl text-warning-400 text-sm">
            Please note: You haven't selected a size or color. Default options will be applied.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Summary Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCheckout} className="glass-card p-6 md:p-8 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-6">Shipping Details</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-300 mb-2">Shipping Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="4"
                className="input-field"
                placeholder="Enter your full delivery address..."
                required
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-6 mt-8">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {['Bank Transfer', 'Credit Card', 'E-Wallet', 'Cash on Delivery'].map((method) => (
                <label key={method} className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${paymentMethod === method ? 'border-primary-500 bg-primary-500/10' : 'border-surface-700 bg-surface-800 hover:border-surface-500'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary-500 bg-surface-900 border-surface-700 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-white font-medium">{method}</span>
                </label>
              ))}
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg shadow-glow">
              Confirm & Pay {shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-800 flex-shrink-0">
                <img 
                  src={`/images/${shoe.shoe_name}.jpg`} 
                  alt={shoe.shoe_name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }}
                />
              </div>
              <div>
                <h4 className="font-semibold text-white line-clamp-2">{shoe.shoe_name}</h4>
                <div className="flex gap-2 text-surface-400 text-xs mt-1">
                  {selectedSize && <span className="bg-surface-700 px-2 py-0.5 rounded">Size: {selectedSize}</span>}
                  {selectedColor && <span className="bg-surface-700 px-2 py-0.5 rounded">Color: {selectedColor}</span>}
                </div>
                <p className="text-primary-400 font-bold mt-2">
                  {shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-surface-700 pt-4 mb-6">
              <div className="flex justify-between text-surface-300">
                <span>Subtotal</span>
                <span className="text-white">{shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
              </div>
              <div className="flex justify-between text-surface-300">
                <span>Shipping</span>
                <span className="text-success-400">Free</span>
              </div>
              <div className="flex justify-between text-surface-300">
                <span>Tax</span>
                <span className="text-white">Rp 0</span>
              </div>
            </div>

            <div className="border-t border-surface-700 pt-4 flex justify-between items-end">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-primary-400">
                {shoe.shoe_price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
