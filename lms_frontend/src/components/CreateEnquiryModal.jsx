import React, { useState } from "react";
import { X } from "lucide-react";
import { createEnquiry } from "../api/enquiriesApi";

const initialForm = {
  title: "",
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  status: "New",
  notes_summary: "",
};

export default function CreateEnquiryModal({ isOpen, onClose, onCreated, onToast }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.first_name.trim() && !form.last_name.trim() && !form.phone.trim() && !form.email.trim()) {
      onToast("Add at least a name, phone number, or email.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createEnquiry({
          title: form.title.trim() || "New Enquiry",
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          status: form.status,
          source: "Manual",
          notes_summary: form.notes_summary.trim(),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Unable to create enquiry.");
      }

      setForm(initialForm);
      onClose();
      onCreated(data);
      onToast("Enquiry created successfully.");
    } catch (error) {
      onToast(error.message || "Unable to create enquiry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500/60 focus:outline-none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0f19] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">New Enquiry</h2>
            <p className="mt-1 text-xs text-slate-400">Create a manual enquiry and contact record.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label htmlFor="enquiry-title" className="mb-1.5 block text-xs font-medium text-slate-300">Enquiry title</label>
            <input id="enquiry-title" name="title" value={form.title} onChange={updateField} placeholder="e.g. Website course enquiry" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="enquiry-first-name" className="mb-1.5 block text-xs font-medium text-slate-300">First name</label>
              <input id="enquiry-first-name" name="first_name" value={form.first_name} onChange={updateField} className={inputClass} />
            </div>
            <div>
              <label htmlFor="enquiry-last-name" className="mb-1.5 block text-xs font-medium text-slate-300">Last name</label>
              <input id="enquiry-last-name" name="last_name" value={form.last_name} onChange={updateField} className={inputClass} />
            </div>
            <div>
              <label htmlFor="enquiry-phone" className="mb-1.5 block text-xs font-medium text-slate-300">Phone</label>
              <input id="enquiry-phone" name="phone" type="tel" value={form.phone} onChange={updateField} className={inputClass} />
            </div>
            <div>
              <label htmlFor="enquiry-email" className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
              <input id="enquiry-email" name="email" type="email" value={form.email} onChange={updateField} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="enquiry-status" className="mb-1.5 block text-xs font-medium text-slate-300">Status</label>
              <select id="enquiry-status" name="status" value={form.status} onChange={updateField} className={inputClass}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Source</label>
              <div className={`${inputClass} text-slate-400`}>Manual</div>
            </div>
          </div>

          <div>
            <label htmlFor="enquiry-notes" className="mb-1.5 block text-xs font-medium text-slate-300">Notes</label>
            <textarea id="enquiry-notes" name="notes_summary" value={form.notes_summary} onChange={updateField} rows={3} placeholder="Add any initial context..." className={`${inputClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}