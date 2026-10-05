import { apiFetch } from "./client";

export const getSavedViews = () => apiFetch("/api/saved-views/");