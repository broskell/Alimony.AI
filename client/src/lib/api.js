import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('alimony_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const errorData = err.response?.data?.error;
    const message = typeof errorData === 'object' && errorData !== null
      ? errorData.message || errorData.code || JSON.stringify(errorData)
      : errorData || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
