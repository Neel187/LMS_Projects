import React, { useEffect, useState } from "react";
import { Calendar, Camera, Mail, Phone, Save, User, X } from "lucide-react";
import { apiFetch } from "../api";

export default function ProfileModal({ isOpen, onClose, onSaved, onToast }) {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    apiFetch("/api/auth/profile/")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load profile");
        return response.json();
      })
      .then((data) => {
        setProfile(data);
        setUsername(data.username || "");
        setBirthdate(data.birthdate || "");
        setPhotoPreview(data.photo_url || null);
      })
      .catch(() => onToast("Could not load your profile.", "error"))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (event) => {
    const selectedPhoto = event.target.files?.[0];
    if (!selectedPhoto) return;
    setPhoto(selectedPhoto);
    setPhotoPreview(URL.createObjectURL(selectedPhoto));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("username", username);
    if (birthdate) formData.append("birthdate", birthdate);
    if (photo) formData.append("photo", photo);

    try {
      const response = await apiFetch("/api/auth/profile/", {
        method: "PATCH",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.username?.[0] || "Could not save profile");
      setProfile(data);
      setPhoto(null);
      setPhotoPreview(data.photo_url || null);
      onSaved(data);
      onToast("Profile updated successfully.");
    } catch (error) {
      onToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Account</p>
            <h2 className="mt-1 text-xl font-bold text-white">Profile details</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" title="Close profile">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-700 ring-2 ring-blue-500/40">
                {photoPreview ? <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" /> : <User size={30} className="text-slate-300" />}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/5">
                <Camera size={16} /> Change photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            <label className="block text-sm text-slate-300">Username
              <input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={150} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-blue-500" placeholder="Add a username" />
            </label>

            <label className="block text-sm text-slate-300">Birthdate
              <input type="date" value={birthdate} onChange={(event) => setBirthdate(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-blue-500" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnlyField icon={<Mail size={15} />} label="Email" value={profile?.email} />
              <ReadOnlyField icon={<Phone size={15} />} label="Mobile" value={profile?.mobile} />
              <ReadOnlyField label="Company ID" value={profile?.company_id} />
              <ReadOnlyField icon={<Calendar size={15} />} label="Profile created" value={profile?.profile_created_at ? new Date(profile.profile_created_at).toLocaleDateString() : "-"} />
            </div>

            <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={17} /> {isSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ icon, label, value }) {
  return <div className="rounded-lg bg-black/20 p-3"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{icon}{label}</p><p className="mt-1 break-all text-sm text-slate-200">{value || "-"}</p></div>;
}
