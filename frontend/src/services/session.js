const SESSION_KEY = "agrilink-session";

// Client-side session persistence (token/profile), stored in browser localStorage.
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save the current signed-in state for page reload continuity.
export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Remove persisted session data during logout.
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}