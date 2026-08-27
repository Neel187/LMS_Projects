import React, { useState } from "react";
import { apiFetch } from "../api";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export default function MetaConnectModal({ isOpen, onClose, onConnected }) {
  const [step, setStep] = useState("initial");
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = React.useRef(null);
  const popupPollRef = React.useRef(null);

  React.useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.origin !== window.location.origin || event.data?.source !== "lms-meta-oauth") return;
      setIsLoading(false);
      if (event.data.status === "connected") {
        popupRef.current?.close();
        popupRef.current = null;
        setStep("connected");
        onConnected?.(event.data);
      } else {
        setStep("initial");
        window.alert(event.data.error || "Meta authorization failed.");
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [onConnected]);

  React.useEffect(() => () => window.clearInterval(popupPollRef.current), []);

  if (!isOpen) return null;

  const handleLaunchMetaOAuth = async () => {
    const popup = window.open("about:blank", "meta-oauth", "width=620,height=760,resizable=yes,scrollbars=yes");
    if (!popup) {
      window.alert("Please allow popups for this site to connect Meta.");
      return;
    }
    popupRef.current = popup;
    setIsLoading(true);
    setStep("connecting");
    try {
      const response = await apiFetch("/api/meta/oauth-url/");
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : {};
      if (!response.ok || !data.meta_oauth_url) throw new Error(data.error || "Unable to start Meta authorization.");
      popup.location.href = data.meta_oauth_url;
      popupPollRef.current = window.setInterval(() => {
        try {
          if (popup.closed) {
            window.clearInterval(popupPollRef.current);
            popupPollRef.current = null;
            setIsLoading(false);
            setStep("initial");
            return;
          }

          if (popup.location.origin !== window.location.origin) return;
          const metaStatus = new URL(popup.location.href).searchParams.get("meta_status");
          if (!metaStatus) return;

          window.clearInterval(popupPollRef.current);
          popupPollRef.current = null;
          popup.close();
          setIsLoading(false);
          if (metaStatus === "connected") {
            setStep("connected");
            onConnected?.({ status: "connected" });
          }
        } catch {
          // The popup is still on Meta's cross-origin page.
        }
      }, 500);
    } catch (err) {
      console.error(err);
      popup.close();
      popupRef.current = null;
      window.clearInterval(popupPollRef.current);
      popupPollRef.current = null;
      setIsLoading(false);
      setStep("initial");
      window.alert(err.message || "Unable to start Meta authorization.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-[580px] bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-blue-500/40 flex flex-col max-h-[90vh]">
        {/* --- Sticky Header --- */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#1877f2] to-[#0056b3] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Share2 size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                Connect Meta Business Portfolio
              </h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                Direct Official Meta OAuth Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Step 1: Initial */}
          {step === "initial" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <ShieldCheck
                  size={22}
                  className="text-[#1877f2] flex-shrink-0 mt-0.5"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Official Meta Graph API OAuth
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Clicking below will open Meta's official login window. You
                    can directly log in with your Facebook account and select
                    which Facebook Pages and Business Portfolios to grant lead
                    retrieval access.
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-blue-300 mb-3">
                  Permissions Requested by Meta:
                </h5>
                <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-400">
                  {[
                    {
                      label: "leads_retrieval",
                      desc: "Instant Form lead ingestion",
                    },
                    {
                      label: "pages_show_list",
                      desc: "Select Business Pages & Portfolios",
                    },
                    {
                      label: "pages_manage_ads",
                      desc: "Automatic Webhook subscription",
                    },
                  ].map((perm, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        <strong className="text-slate-200">{perm.label}</strong>
                        : {perm.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleLaunchMetaOAuth}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#1877f2] hover:bg-[#0a63d6] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25"
              >
                <Share2 size={18} />
                <span>Launch Meta OAuth Authorization</span>
                <ExternalLink size={14} />
              </button>
            </div>
          )}

          {/* Step 2: Connecting */}
          {step === "connecting" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <RefreshCw size={36} className="text-[#1877f2] animate-spin" />
              <div>
                <h4 className="text-lg font-semibold text-white">
                  Opening Authorization Window...
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  Connecting to Facebook Graph API OAuth Endpoint
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Connected */}
          {step === "connected" && (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 size={34} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  Successfully Connected!
                </h4>
                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                  Every lead submitted through your Meta Instant Forms will now
                  be automatically ingested, deduplicated, and listed in your
                  Enquiries workspace in real time.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-8 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/10 transition-colors"
              >
                Done & Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
