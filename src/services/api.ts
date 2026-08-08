import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store';

// We'll use a mocked base URL or environment variable later
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://arenova-backend-production-8430.up.railway.app/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // In a real app, we'd get this from the store or secure storage directly
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle token refresh logic here or simply logout
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);
