// In production, set VITE_API_URL to your ALB DNS name (or domain) at build time,
// e.g. VITE_API_URL=https://api.yourdomain.com
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getTasks: () => request("/api/tasks"),
  createTask: (task) =>
    request("/api/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id, patch) =>
    request(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
};
