import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed right-4 top-4 z-[200] w-[min(380px,calc(100vw-2rem))] animate-fade-in">
      <div
        role="alert"
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
          isError
            ? "border-red-400/30 bg-red-950/90 text-red-100"
            : "border-emerald-400/30 bg-emerald-950/90 text-emerald-100"
        }`}
      >
        {isError ? (
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-300" />
        ) : (
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-300" />
        )}
        <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="-mr-1 -mt-1 rounded-md p-1 text-current/70 transition-colors hover:bg-white/10 hover:text-current"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
