import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: window.location.origin === 'http://localhost:5173'
    ? 'http://localhost:3000/'
    : 'https://backend-test-61bx.onrender.com/',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || 'Ocorreu um erro na requisição';
    return Promise.reject({ message: errorMessage });
  }
);

export default axiosInstance;