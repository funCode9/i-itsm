import axios from 'axios';

const CLOUD_API = 'https://i-itsm-backend.onrender.com/api';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When hosted on Render, Netlify, Vercel, or any remote production domain
    if (host.includes('onrender.com') || host.includes('render') || !['localhost', '127.0.0.1'].includes(host)) {
      return CLOUD_API;
    }
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 50000, // 50 seconds to smoothly handle Render cloud instance wakeups
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Resilient fallback: If local /api proxy is down, seamlessly route to Cloud Backend
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    if (
      config &&
      !config._fallbackTried &&
      config.baseURL === '/api' &&
      (err.code === 'ERR_NETWORK' || !err.response || err.response.status >= 500)
    ) {
      config._fallbackTried = true;
      config.baseURL = CLOUD_API;
      console.warn('[I-ITSM] Local backend unreachable. Automatically retrying with Cloud Backend:', CLOUD_API);
      return api(config);
    }

    // Handle 401 — redirect to login, except for auth requests
    if (err.response?.status === 401 && !config?.url?.includes('/auth/')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
