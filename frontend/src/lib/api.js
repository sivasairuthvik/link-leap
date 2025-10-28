// Normalize API_BASE: remove trailing slash if present
const raw = import.meta.env.VITE_API_BASE || '';
export const API_BASE = raw.replace(/\/$/, '');

export async function apiFetch(path, opts = {}) {
  // Ensure path starts with a single '/'
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = API_BASE ? `${API_BASE}${p}` : p; // relative when API_BASE is empty
  return fetch(url, opts);
}
