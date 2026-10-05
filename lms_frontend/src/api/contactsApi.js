import { apiFetch } from "./client";

export const getContacts = () => apiFetch("/api/contacts/");