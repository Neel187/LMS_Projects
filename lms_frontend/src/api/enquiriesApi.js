import { apiFetch } from "./client";

export const getEnquiries = (query = "format=json") =>
  apiFetch(`/api/enquiries/${query ? `?${query}` : ""}`);

export const searchEnquiries = (searchTerm) =>
  apiFetch(`/api/enquiries/?search=${encodeURIComponent(searchTerm)}`);

export const createEnquiry = (enquiry) => apiFetch("/api/enquiries/", {
  method: "POST",
  body: JSON.stringify(enquiry),
});

export const updateEnquiryStatus = (enquiryId, status) => apiFetch(`/api/enquiries/${enquiryId}/update_status/`, {
  method: "POST",
  body: JSON.stringify({ status }),
});

export const addEnquiryNote = (enquiryId, note) => apiFetch(`/api/enquiries/${enquiryId}/add_note/`, {
  method: "POST",
  body: JSON.stringify({ note }),
});

export const scheduleEnquiryFollowUp = (enquiryId, followUpDate) => apiFetch(`/api/enquiries/${enquiryId}/schedule_followup/`, {
  method: "POST",
  body: JSON.stringify({ follow_up_date: followUpDate }),
});