import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function SignIn({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", credentials);
      Swal.fire({ toast: true, position: "top-end", title: "Welcome back!", text: "Login successful", icon: "success", confirmButtonText: "Continue", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#6366f1" });
      const { username, role, access_token, user_id } = response.data;
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("isLoggedIn", true);
      onLogin(username, role);
      navigate(role === "Admin" ? "/admin" : "/");
    } catch (error) {
      Swal.fire({ title: "Login Failed", text: error.response?.data?.message || "Please try again.", icon: "error", confirmButtonText: "OK", background: "#1e293b", color: "#f1f5f9", confirmButtonColor: "#ef4444" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      <div className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-surface-400 mt-2">Sign in to your account</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Username</label>
            <input type="text" name="username" placeholder="Enter your username" value={credentials.username} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={credentials.password} onChange={handleChange} className="input-field pr-12" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className={`btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
            {loading ? (<div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in...</div>) : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-surface-400 text-sm">
          Don't have an account? <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
