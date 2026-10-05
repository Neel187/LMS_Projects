import { apiFetch } from "./client";

export const authenticate = (action, payload) => apiFetch(`/api/auth/${action}/`, {
  method: "POST",
  body: JSON.stringify(payload),
});

export const startGoogleSignIn = () => window.location.assign("/api/auth/google/login/");
export const getProfile = () => apiFetch("/api/auth/profile/");
export const updateProfile = (formData) => apiFetch("/api/auth/profile/", {
  method: "PATCH",
  body: formData,
});
export const getEmployees = () => apiFetch("/api/auth/employees/list/");
export const createEmployee = (employee) => apiFetch("/api/auth/employees/", {
  method: "POST",
  body: JSON.stringify(employee),
});
export const updateEmployee = (employeeId, changes) => apiFetch(`/api/auth/employees/${employeeId}/`, {
  method: "PATCH",
  body: JSON.stringify(changes),
});