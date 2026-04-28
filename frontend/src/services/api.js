const DEFAULT_BASES = ["http://localhost:5000/api", "http://localhost:8080/api"];
const API_BASE = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASES[0];

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    // Send JWT from client-side session for protected backend endpoints.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const baseCandidates = process.env.REACT_APP_API_BASE_URL
    ? [process.env.REACT_APP_API_BASE_URL]
    : DEFAULT_BASES;

  let lastNetworkError = null;

  for (const baseUrl of baseCandidates) {
    try {
      console.log(`[API] ${method} ${baseUrl}${path}`, { hasToken: !!token, headerKeys: Object.keys(headers) });

      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`[API] Error on ${path}:`, response.status, data);
        throw new Error(data?.message || "Request failed");
      }

      return data;
    } catch (error) {
      // Retry on connection-level failures when multiple base URLs are available.
      if (error instanceof TypeError && baseCandidates.length > 1) {
        lastNetworkError = error;
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Unable to connect to API. Tried: ${baseCandidates.join(", ")}${lastNetworkError ? ` (${lastNetworkError.message})` : ""}`
  );
}

export { API_BASE };