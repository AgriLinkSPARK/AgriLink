const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log(`[API] ${method} ${API_BASE}${path}`, { hasToken: !!token, headerKeys: Object.keys(headers) });

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`[API] Error on ${path}:`, response.status, data);
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export { API_BASE };