import React, { useState } from "react";
import { Lock, Mail, Phone, UserPlus, X } from "lucide-react";
import { createEmployee } from "../api/authApi";

export default function EmployeeModal({ isOpen, onClose, onToast }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
    email: "",
    password: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const updateField = (field) => (event) => {
    const value = field === "is_active" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await createEmployee(form);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.detail || Object.values(data).flat().join(" ");
        throw new Error(detail || "Unable to create employee.");
      }

      onToast?.(`${data.first_name} ${data.last_name} was added as an employee.`);
      setForm({ first_name: "", last_name: "", mobile: "", email: "", password: "", is_active: true });
      onClose();
    } catch (requestError) {
      const message = requestError instanceof TypeError
        ? "Unable to connect to the server."
        : requestError.message || "Unable to create employee.";
      setError(message);
      onToast?.(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-[#0b0f19]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Add New Employee</h3>
            <p className="text-xs text-slate-400 mt-1">Create an employee account in your company.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">First Name</span>
              <input required value={form.first_name} onChange={updateField("first_name")} className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="John" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Last Name</span>
              <input required value={form.last_name} onChange={updateField("last_name")} className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="Doe" />
            </label>
          </div>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-400">Email</span>
            <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input required type="email" value={form.email} onChange={updateField("email")} className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="name@company.com" /></div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Mobile</span>
              <div className="relative"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input required type="tel" value={form.mobile} onChange={updateField("mobile")} className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="+1 555 123 4567" /></div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400">Temporary Password</span>
              <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input required type="password" minLength={8} value={form.password} onChange={updateField("password")} className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" placeholder="At least 8 characters" /></div>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.is_active} onChange={updateField("is_active")} className="h-4 w-4 accent-emerald-500" />
            Active account
          </label>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            <UserPlus size={17} />
            {loading ? "Creating employee..." : "Create Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}
