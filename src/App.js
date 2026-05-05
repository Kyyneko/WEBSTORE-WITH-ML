import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import Swal from "sweetalert2";
import axios from "axios";

import Recomended from "./components/client/Recomended";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import ShoeDetail from "./components/client/ShoeDetail";
import Cart from "./components/client/Cart";
import Payment from "./components/client/Payment";
import Checkout from "./components/client/Checkout";
import Product from "./components/client/Product";
import AdminSepatu from "./components/admin/AdminSepatu";
import AdminUser from "./components/admin/AdminUser";
import AdminPayments from "./components/admin/AdminPayments";
import AdminWishlists from "./components/admin/AdminWishlists";
import AdminOrders from "./components/admin/AdminOrders";
import AdminInteractions from "./components/admin/AdminInteractions";
import OrderPage from "./components/client/OrderPage";
import ProfilePage from "./components/client/ProfilePage";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) return <Navigate to="/signin" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  if (role === "User") return <Navigate to="/" />;
  return children;
};

// ===== FOOTER COMPONENT =====
const Footer = () => (
  <footer className="footer">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-display text-xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Roots & Routes</h3>
          <p className="text-surface-400 text-sm leading-relaxed">Premium shoe e-commerce platform with AI-powered recommendations. Discover your perfect style.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-surface-400 hover:text-primary-400 text-sm transition-colors">Products</Link>
            <Link to="/recomended" className="text-surface-400 hover:text-primary-400 text-sm transition-colors">Recommendations</Link>
            <Link to="/orders" className="text-surface-400 hover:text-primary-400 text-sm transition-colors">My Orders</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <p className="text-surface-400 text-sm">support@rootsroutes.com</p>
          <p className="text-surface-400 text-sm mt-1">Makassar, Indonesia</p>
        </div>
      </div>
      <div className="border-t border-surface-700 pt-6 text-center">
        <p className="text-surface-500 text-sm">&copy; 2026 Roots & Routes. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// ===== HOME COMPONENT =====
const Home = () => (
  <section className="hero">
    <div className="text-container animate-fade-in">
      <span className="badge-primary mb-4 inline-block">✨ AI-Powered Recommendations</span>
      <h1 className="title">Step Into Your<br/>Perfect Style</h1>
      <p className="description">
        Roots & Routes connects you with premium footwear from world-class brands.
        Our AI-powered engine learns your style and suggests shoes you'll love.
      </p>
      <div className="flex gap-4 flex-wrap">
        <Link to="/products">
          <button className="btn-primary">Explore Products</button>
        </Link>
        <Link to="/recomended">
          <button className="btn-outline">Get Recommendations</button>
        </Link>
      </div>
      <div className="flex gap-8 mt-12">
        <div><p className="text-2xl font-bold text-white">50+</p><p className="text-surface-400 text-sm">Products</p></div>
        <div><p className="text-2xl font-bold text-white">5</p><p className="text-surface-400 text-sm">Categories</p></div>
        <div><p className="text-2xl font-bold text-white">AI</p><p className="text-surface-400 text-sm">Powered</p></div>
      </div>
    </div>
    <div className="image-container animate-fade-in">
      <img src="/images/cart_ring.png" alt="Premium Shoes Collection" />
    </div>
  </section>
);

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUser && storedRole) { setUser(storedUser); setRole(storedRole); }

    // Global Axios Interceptor for handling expired/invalid tokens
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
          localStorage.clear();
          setUser(null);
          setRole(null);
          Swal.fire({
            title: "Session Expired",
            text: "Your login session has expired. Please log in again.",
            icon: "warning",
            background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1"
          }).then(() => {
            navigate("/signin");
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const handleLogin = (username, userRole) => {
    setUser(username); setRole(userRole);
    localStorage.setItem("username", username);
    localStorage.setItem("role", userRole);
  };

  const handleLogout = () => {
    Swal.fire({ title: "Log out?", text: "Are you sure you want to log out?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, log out", cancelButtonText: "Cancel", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1" }).then((result) => {
      if (result.isConfirmed) { setUser(null); setRole(null); localStorage.clear(); navigate("/"); }
    });
  };

  return (
    <div className="App min-h-screen bg-surface-950 flex flex-col">
      <header className="navbar">
        <Link to="/" className="logo">R&R</Link>

        <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
          <span></span><span></span><span></span>
        </button>

        <nav className={`menu ${mobileMenu ? "mobile-open" : ""}`}>
          <Link to="/" className="menu-item" onClick={() => setMobileMenu(false)}>Home</Link>
          {role === "User" && (<>
            <Link to="/recomended" className="menu-item" onClick={() => setMobileMenu(false)}>Recommended</Link>
            <Link to="/products" className="menu-item" onClick={() => setMobileMenu(false)}>Products</Link>
            <Link to="/orders" className="menu-item" onClick={() => setMobileMenu(false)}>Orders</Link>
            <Link to="/cart" className="menu-item flex items-center gap-2" onClick={() => setMobileMenu(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Cart
            </Link>
          </>)}
          {role === "Admin" && (<>
            <Link to="/admin/categories" className="menu-item" onClick={() => setMobileMenu(false)}>Categories</Link>
            <Link to="/admin/users" className="menu-item" onClick={() => setMobileMenu(false)}>Users</Link>
            <Link to="/admin/payments" className="menu-item" onClick={() => setMobileMenu(false)}>Payments</Link>
            <Link to="/admin/wishlists" className="menu-item" onClick={() => setMobileMenu(false)}>Wishlists</Link>
            <Link to="/admin/orders" className="menu-item" onClick={() => setMobileMenu(false)}>Orders</Link>
            <Link to="/admin/interactions" className="menu-item" onClick={() => setMobileMenu(false)}>Interactions</Link>
          </>)}
        </nav>

        <div className="auth-buttons">
          {user ? (
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-sm text-surface-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-surface-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">{user.charAt(0).toUpperCase()}</div>
                <span className="hidden sm:block">{user}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden animate-slide-down shadow-xl z-50">
                  <button className="w-full text-left px-4 py-3 text-sm text-surface-300 hover:text-white hover:bg-surface-700 transition-colors flex items-center gap-2" onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm text-danger-400 hover:bg-surface-700 transition-colors flex items-center gap-2" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (<>
            <Link to="/signin"><button className="btn-ghost text-sm">Sign In</button></Link>
            <Link to="/signup"><button className="btn-primary text-sm !px-4 !py-2">Sign Up</button></Link>
          </>)}
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/recomended" element={<PrivateRoute><Recomended /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Product /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout/:id" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminSepatu /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminSepatu /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUser /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/wishlists" element={<AdminRoute><AdminWishlists /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/interactions" element={<AdminRoute><AdminInteractions /></AdminRoute>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
