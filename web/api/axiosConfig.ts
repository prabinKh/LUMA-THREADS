import axios from 'axios';
import { getTenantHeaders, tenantStorageKey } from '@/lib/tenant';
import { safeStorage } from '@/lib/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Get token directly from storage to avoid circular dependency with authService
    const token = safeStorage.getItem(tenantStorageKey("access_token")) || safeStorage.getItem("access_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantHeaders = getTenantHeaders();
    Object.assign(config.headers, tenantHeaders);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized without ejecting admin users into broken 404 pages
      console.warn('Unauthorized access - potential token expiration');
      safeStorage.removeItem(tenantStorageKey("access_token"));
      safeStorage.removeItem(tenantStorageKey("refresh_token"));
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin') && currentPath !== '/account/login' && currentPath !== '/login') {
          window.location.href = '/account/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
