const getAccessToken = () => localStorage.getItem("lms_token");

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("lms_refresh_token");
  if (!refresh) return null;

  const response = await fetch("/api/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_refresh_token");
    return null;
  }

  const data = await response.json();
  localStorage.setItem("lms_token", data.access);
  return data.access;
};

export async function apiFetch(url, options = {}, canRetry = true) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = typeof options.body !== "undefined" && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && hasBody && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401 || !canRetry) return response;

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) return response;

  headers.set("Authorization", `Bearer ${refreshedToken}`);
  return fetch(url, { ...options, headers });
}
