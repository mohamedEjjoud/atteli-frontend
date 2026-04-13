import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://atteli-backend-production.up.railway.app/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const token = data.data.accessToken;
        localStorage.setItem('accessToken', token);
        processQueue(null, token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login:   (email, password) => api.post('/auth/login', { email, password }),
  logout:  ()                => api.post('/auth/logout'),
  refresh: ()                => api.post('/auth/refresh'),
  me:      ()                => api.get('/auth/me'),
};

export const productsAPI = {
  getAll:       (params)           => api.get('/products', { params }),
  getDashboard: ()                 => api.get('/products/dashboard'),
  getCategories:()                 => api.get('/products/categories'),
  getById:      (id)               => api.get(`/products/${id}`),
  getHistory:   (id)               => api.get(`/products/${id}/history`),
  create:       (data)             => api.post('/products', data),
  update:       (id, data)         => api.patch(`/products/${id}`, data),
  updateStock:  (id, data)         => api.patch(`/products/${id}/stock`, data),
  delete:       (id)               => api.delete(`/products/${id}`),
};

export default api;
