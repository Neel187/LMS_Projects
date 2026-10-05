import { apiFetch } from "./client";

export const getMetaAccount = () => apiFetch("/api/meta/account/");
export const updateMetaAccount = (changes) => apiFetch("/api/meta/account/", {
  method: "POST",
  body: JSON.stringify(changes),
});
export const disconnectMetaAccount = () => apiFetch("/api/meta/account/", {
  method: "DELETE",
});
export const getMetaOAuthUrl = () => apiFetch("/api/meta/oauth-url/");