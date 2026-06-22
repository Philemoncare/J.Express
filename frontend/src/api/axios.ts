import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL;

  if (url) {
    // Ensure URL ends with /api if it's missing, making it bulletproof
    return url.endsWith('/api') || url.endsWith('/api/')
      ? url
      : `${url.replace(/\/+$/, '')}/api`;
  }

  // Auto-detect backend if running on Vercel or same host
  const host = window.location.hostname;
  if (host.includes('vercel.app') || host.includes('localhost') || host.includes('10.')) {
      // If we are on HTTPS (Vercel), we should call HTTPS.
      // If we are on port 3000 (Vite), we usually call 8080.
      const protocol = window.location.protocol;
      const port = host.includes('localhost') || host.match(/^\d+\./) ? ':8080' : '';
      return `${protocol}//${host}${port}/api`;
  }
  return `http://${host}:8080/api`;
};

const api = axios.create({
  baseURL: getBaseURL().replace(/\/+$/, ''), // Remove all trailing slashes
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Automatic Retry on Network Errors
    if (error.code === 'ERR_NETWORK' && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        // Exponential backoff: wait 1s, then 2s, then 3s
        await new Promise(resolve => setTimeout(resolve, originalRequest._retryCount * 1000));
        return api(originalRequest);
    }

    // Handle Token Refreshing on 401
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login')) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/refresh`, {}, { withCredentials: true });
        const newToken = data.data.access_token;
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
