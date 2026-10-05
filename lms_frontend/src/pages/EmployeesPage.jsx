import React, { useEffect, useState } from "react";
import { Activity, CheckCircle2, ChevronDown, Mail, Phone, RefreshCw, Shield, User, Users } from "lucide-react";
import { getEmployees, updateEmployee } from "../api/authApi";

const statusItems = [
  ["new", "New", "text-blue-300"],
  ["contacted", "Contacted", "text-amber-300"],
  ["qualified", "Qualified", "text-cyan-300"],
  ["closed", "Closed", "text-emerald-300"],
  ["lost", "Lost", "text-red-300"],
];

export default function EmployeeManagementView({ onToast }) {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEmployees();
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data.detail || "Unable to load employees.");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const toggleActive = async (employee) => {
    setUpdatingId(employee.id);
    try {
      const response = await updateEmployee(employee.id, { is_active: !employee.is_active });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to update account status.");
      setEmployees((current) => current.map((item) => item.id === employee.id ? data : item));
      onToast?.(`${employee.first_name} ${employee.last_name} is now ${data.is_active ? "active" : "inactive"}.`);
    } catch (requestError) {
      onToast?.(requestError.message || "Unable to update account status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={21} className="text-emerald-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Employee Management</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">Review account access and work progress across your team.</p>
        </div>
        <button onClick={loadEmployees} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50" title="Refresh employees">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {!loading && !error && employees.length === 0 && (
        <div className="glass-panel rounded-xl border border-white/5 bg-white/5 p-10 text-center">
          <Users size={30} className="mx-auto text-slate-500" />
          <p className="mt-3 text-white font-medium">No employees yet</p>
          <p className="mt-1 text-sm text-slate-500">Use Add Employee in the top navigation to create the first account.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {employees.map((employee) => {
          const progress = employee.progress || {};
          const isSelected = selectedId === employee.id;
          return (
            <article key={employee.id} className="glass-panel rounded-xl border border-white/5 bg-white/5 overflow-hidden">
              <button onClick={() => setSelectedId(isSelected ? null : employee.id)} className="w-full text-left p-5 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <User size={20} className="text-emerald-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{employee.first_name} {employee.last_name}</h3>
                      <p className="text-xs text-slate-400 truncate">{employee.email}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform ${isSelected ? "rotate-180" : ""}`} />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Assigned</p><p className="text-lg font-bold text-white mt-1">{progress.total_enquiries || 0}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Closed</p><p className="text-lg font-bold text-emerald-300 mt-1">{progress.closed || 0}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Activity</p><p className="text-lg font-bold text-cyan-300 mt-1">{progress.activity_count || 0}</p></div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">Completion rate</span><span className="text-white font-semibold">{progress.completion_rate || 0}%</span></div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress.completion_rate || 0}%` }} /></div>
                </div>
              </button>

              {isSelected && (
                <div className="border-t border-white/5 px-5 py-4 space-y-4">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail size={13} />{employee.email}</span>
                    <span className="flex items-center gap-1.5"><Phone size={13} />{employee.mobile}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {statusItems.map(([key, label, color]) => <div key={key} className="rounded-lg bg-black/20 p-2.5"><p className={`text-xs ${color}`}>{label}</p><p className="text-base font-semibold text-white mt-1">{progress[key] || 0}</p></div>)}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${employee.is_active ? "text-emerald-300" : "text-red-300"}`}><Activity size={14} />{employee.is_active ? "Account active" : "Account inactive"}</span>
                    <button onClick={() => toggleActive(employee)} disabled={updatingId === employee.id} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${employee.is_active ? "bg-red-500/10 text-red-300 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"}`}>
                      {updatingId === employee.id ? "Updating..." : employee.is_active ? "Deactivate account" : "Activate account"}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
