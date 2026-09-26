import axios from 'axios';

export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://expense-api-yfya.onrender.com').replace(/\/$/, '');

const TOKEN_KEY = 'jwtToken';

// "Remember me" keeps the token in localStorage; otherwise it lasts for the browser session.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token, remember) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({ baseURL: API_BASE, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/signup');
    if (status === 401 && !isAuthCall) {
      clearToken();
      const here = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign(`/login?expired=1&next=${encodeURIComponent(here)}`);
      }
    }
    return Promise.reject(error);
  }
);

/** A human-readable message for any API error. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code === 'ECONNABORTED') return 'The server took too long to answer. It may be waking up, so try again in a moment.';
  if (!error.response) return 'Cannot reach the server. Check your connection, or wait a moment while it wakes up.';
  const data = error.response.data;
  if (typeof data === 'string' && data.length < 200) return data;
  return data?.message || fallback;
}

/** Field-level validation errors from a 400 response, if any. */
export function fieldErrors(error) {
  return error?.response?.data?.errors || {};
}

/** Render's free tier sleeps; ping it early so the first real request is quick. */
export function wakeServer() {
  return axios.get(`${API_BASE}/health`, { timeout: 60000 }).catch(() => {});
}
