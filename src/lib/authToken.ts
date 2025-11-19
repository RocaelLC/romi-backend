const KEY = "romi_token";

export function setAuthToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getAuthToken(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function clearAuthToken() {
  localStorage.removeItem(KEY);
}
