// ── Change this URL every time tunnel restarts ──────────────
// Isko update karo apni current lhr.life URL se
const BASE = import.meta.env.VITE_API_URL || 'https://b23c5d36fa325d.lhr.life';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    req('POST', '/api/auth/admin/login', { username, password }),

  // Stats
  getStats: () => req('GET', '/api/admin/stats'),

  // Retailers
  getRetailers: () => req('GET', '/api/admin/retailers'),
  addRetailer: (data) => req('POST', '/api/admin/retailers', data),
  updateRetailer: (id, data) => req('PATCH', `/api/admin/retailers/${id}`, data),
  deleteRetailer: (id) => req('DELETE', `/api/admin/retailers/${id}`),

  // Devices
  getDevices: () => req('GET', '/api/admin/devices'),
  lockDevice: (id) => req('POST', `/api/device/${id}/lock`, { reason: 'Admin lock' }),
  unlockDevice: (id) => req('POST', `/api/device/${id}/unlock`, { reason: 'Admin unlock' }),

  // Logs
  getLogs: () => req('GET', '/api/admin/logs'),
};
