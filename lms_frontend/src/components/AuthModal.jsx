import React, { useState } from "react";
import { X, Lock, Mail, Phone, ArrowRight } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onToast }) {
  const [tab, setTab] = useState("login"); // 'login' or 'register'
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setError("");
    setLoading(true);
    window.location.assign("/api/auth/google/login/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = tab === "login"
      ? { identifier, password }
      : {
          first_name: firstName,
          last_name: lastName,
          mobile,
          email,
          password,
          role,
          is_active: isActive,
        };

    try {
      const response = await fetch(`/api/auth/${tab}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};
      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Server returned an invalid response (${response.status}).`);
        }
      }

      if (!response.ok) {
        const detail = data.detail || Object.values(data).flat().join(" ");
        throw new Error(detail || "Authentication failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("The server returned an incomplete authentication response.");
      }

      localStorage.setItem("lms_token", data.token);
      localStorage.setItem("lms_refresh_token", data.refresh);
      onToast?.(
        tab === "login"
          ? "Login successful. Welcome back."
          : "Registration successful. Welcome to your workspace."
      );
      onLoginSuccess(data.user);
      onClose();
    } catch (requestError) {
      const message = requestError instanceof TypeError
        ? "Unable to connect to the server. Start the Django backend on port 8000."
        : requestError.message || "Unable to connect to the server.";
      setError(message);
      onToast?.(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-[440px] bg-[#0b0f19] rounded-2xl overflow-hidden shadow-2xl border border-blue-500/30 flex flex-col max-h-[90vh]">
        {/* --- Sticky Header --- */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h3 className="text-lg font-bold text-white truncate">
              {tab === "login" ? "Welcome Back" : "Create Your Account"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {tab === "login"
                ? "Access your lead management workspace"
                : "Create an admin or employee workspace account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {tab === "login" ? "Sign In with Google" : "Sign Up with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <div className="flex-1 h-px bg-white/10" />
            <span>{tab === "login" ? "Or continue with email or mobile" : "Enter your account details"}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
            {tab === "register" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Last Name</label>
                  <input type="text" required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                </div>
              </div>
            )}

            {tab === "login" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-1">Email or Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="name@company.com or +1 555 123 4567"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Mobile</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="tel" required placeholder="+1 555 123 4567" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
              </div>
            )}

            {tab === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 ml-1">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-blue-500" />
                  Is Active
                </label>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
            >
              <span>
                {loading
                  ? "Authenticating..."
                  : tab === "login"
                    ? "Sign In to Workspace"
                    : "Create Free Account"}
              </span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="text-center text-xs sm:text-sm text-slate-400 mt-1">
            {tab === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="text-blue-400 hover:text-blue-300 font-medium underline transition-colors"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  onClick={() => setTab("login")}
                  className="text-blue-400 hover:text-blue-300 font-medium underline transition-colors"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
