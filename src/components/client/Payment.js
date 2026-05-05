import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const handlePayment = () => { setPaymentStatus("Success"); };

  const methods = [
    { value: "Credit Card", icon: "💳" },
    { value: "Bank Transfer", icon: "🏦" },
    { value: "E-Wallet", icon: "📱" },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <div className="glass-card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-success-500 to-primary-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
          <h2 className="font-display text-2xl font-bold text-white">Complete Payment</h2>
          <p className="text-surface-400 mt-1">Product #{id}</p>
        </div>
        <div className="space-y-3 mb-6">
          {methods.map((m) => (
            <button key={m.value} onClick={() => setPaymentMethod(m.value)} className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${paymentMethod === m.value ? "bg-primary-500/20 border-primary-500 border" : "glass-light border border-transparent hover:border-surface-600"}`}>
              <span className="text-xl">{m.icon}</span>
              <span className="text-white font-medium">{m.value}</span>
              {paymentMethod === m.value && <span className="ml-auto text-primary-400">✓</span>}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-surface-800/50 mb-6">
          <p className="text-surface-400 text-sm">Status</p>
          <p className={`font-bold ${paymentStatus === "Success" ? "text-success-400" : "text-warning-400"}`}>{paymentStatus}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePayment} disabled={!paymentMethod} className={`btn-primary flex-1 ${!paymentMethod ? "opacity-50 cursor-not-allowed" : ""}`}>Confirm Payment</button>
          <button onClick={() => navigate(-1)} className="btn-ghost border border-surface-600">Cancel</button>
        </div>
      </div>
    </div>
  );
}
export default Payment;
