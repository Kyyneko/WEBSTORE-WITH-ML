import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.data && res.data.display_name) {
        setAddress(res.data.display_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return position === null ? null : (
    <Marker position={position} draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          fetchAddress(pos.lat, pos.lng);
        },
      }}
    ></Marker>
  );
}

function Checkout() {
  const { id } = useParams();
  const isCartMode = id === "cart";
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout form state
  const [shippingAddress, setShippingAddress] = useState("");
  const [position, setPosition] = useState({ lat: -5.147665, lng: 119.432732 }); // Default Makassar
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  
  // Map Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingMap, setSearchingMap] = useState(false);
  
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchUserProfile();
    if (isCartMode) {
      fetchCart();
    } else {
      fetchShoeDetail();
    }
  }, [id]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCheckoutItems(response.data);
      } else {
        Swal.fire({ title: "Cart Empty", text: "Your cart is empty.", icon: "info", background: "#1e293b", color: "#f1f5f9" });
        navigate("/cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Swal.fire({ title: "Error", text: "Failed to load cart", icon: "error", background: "#1e293b", color: "#f1f5f9" });
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchShoeDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const shoeData = response.data;
      
      const tSize = localStorage.getItem("temp_checkout_size") || "";
      const tColor = localStorage.getItem("temp_checkout_color") || "";
      
      setCheckoutItems([{
        shoe_detail_id: shoeData.shoe_detail_id,
        shoe_name: shoeData.shoe_name,
        shoe_price: shoeData.shoe_price,
        selected_size: tSize,
        selected_color: tColor,
        quantity: 1
      }]);
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

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchingMap(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
        setShippingAddress(display_name);
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Location not found', background: '#1e293b', color: '#f1f5f9' });
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setSearchingMap(false);
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
        order_status: "Pending",
        order_date: new Date().toISOString().split('T')[0],
        shipping_address: shippingAddress,
        items: checkoutItems.map(item => ({
          shoe_detail_id: item.shoe_detail_id,
          amount: item.shoe_price * item.quantity,
          selected_size: item.selected_size,
          selected_color: item.selected_color,
          quantity: item.quantity
        }))
      };

      await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isCartMode) {
        // Clear the cart
        await Promise.all(checkoutItems.map(item => 
          axios.delete(`http://localhost:5000/api/cart/${item.id_cart}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(e => console.error("Failed to delete cart item", e))
        ));
      }

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
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Failed to place order. Please try again.", icon: "error", background: "#1e293b", color: "#f1f5f9" });
    }
  };

  const totalPrice = checkoutItems.reduce((sum, item) => sum + (item.shoe_price * item.quantity), 0);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  if (checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Checkout</h2>
        <p className="text-surface-400">Complete your purchase details below.</p>
        {(!isCartMode && (!checkoutItems[0]?.selected_size || !checkoutItems[0]?.selected_color)) && (
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
              <label className="block text-sm font-medium text-surface-300 mb-2">Pin Your Location (Optional)</label>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleMapSearch(e); }}
                  placeholder="Search a city, place, or street..." 
                  className="input-field flex-1"
                />
                <button 
                  type="button"
                  onClick={handleMapSearch} 
                  disabled={searchingMap}
                  className="px-4 bg-surface-700 hover:bg-surface-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {searchingMap ? (
                    <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  )}
                  Search
                </button>
              </div>

              <div className="h-64 rounded-xl overflow-hidden border border-surface-700 mb-4 z-0 relative">
                <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} setAddress={setShippingAddress} />
                </MapContainer>
              </div>

              <label className="block text-sm font-medium text-surface-300 mb-2">Shipping Address Details</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="3"
                className="input-field"
                placeholder="Enter or pin your full delivery address..."
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
              Confirm & Pay {totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            <div className="max-h-64 overflow-y-auto pr-2 mb-6 space-y-4 custom-scrollbar">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-800 flex-shrink-0">
                    <img 
                      src={`/images/${item.shoe_name}.jpg`} 
                      alt={item.shoe_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/images/sneakers_nike.png"; }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white line-clamp-2 text-sm">{item.shoe_name}</h4>
                    <div className="flex gap-2 text-surface-400 text-xs mt-1">
                      {item.selected_size && <span className="bg-surface-700 px-2 py-0.5 rounded">Size: {item.selected_size}</span>}
                      {item.selected_color && <span className="bg-surface-700 px-2 py-0.5 rounded">Color: {item.selected_color}</span>}
                      <span className="bg-surface-700 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                    </div>
                    <p className="text-primary-400 font-bold mt-1 text-sm">
                      {(item.shoe_price * item.quantity).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-surface-700 pt-4 mb-6">
              <div className="flex justify-between text-surface-300">
                <span>Subtotal</span>
                <span className="text-white">{totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
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
                {totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
