import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function SignUp() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      Swal.fire({ toast: true, position: 'top-end', title: 'Account Created!', text: 'You can now sign in with your credentials.', icon: 'success', confirmButtonText: 'Sign In', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' }).then(() => navigate('/signin'));
    } catch (error) {
      Swal.fire({ title: 'Registration Failed', text: error.response?.data?.message || 'Please try again.', icon: 'error', confirmButtonText: 'OK', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#ef4444' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="glass-card p-8 sm:p-10 w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
          <p className="text-surface-400 mt-2">Join Roots & Routes today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">First Name</label>
              <input type="text" name="firstName" placeholder="John" onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Last Name</label>
              <input type="text" name="lastName" placeholder="Doe" onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Username</label>
            <input type="text" name="username" placeholder="Choose a username" required onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
            <input type="email" name="email" placeholder="you@example.com" required onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
            <input type="password" name="password" placeholder="Create a password" required onChange={handleChange} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className={`btn-primary w-full mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loading ? (<div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating...</div>) : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-surface-400 text-sm">
          Already have an account? <Link to="/signin" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign In</Link>
        </p>
        <p className="mt-3 text-center text-surface-500 text-xs">
          By signing up, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default SignUp;
