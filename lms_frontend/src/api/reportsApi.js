import { apiFetch } from "./client";

export const getDashboardStats = () => apiFetch("/api/dashboard/stats/");