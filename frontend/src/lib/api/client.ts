import axios from 'axios';
import { useAuthStore } from '@/lib/auth/store';
import { buildLoginRedirectUrl, buildPathFromLocation } from '@/lib/auth/redirect';

// Create API client instance with correct configurations
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cross-origin requests
});

// Request interceptor for attaching auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const requestUrl = String(originalRequest.url || '');
        const isAuthRequest =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/refresh');

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            // Use the store's logout method to ensure state is properly cleared
            useAuthStore.getState().logout();

            // Redirect to login and preserve the current page for post-login return
            const currentPath = buildPathFromLocation(
                window.location.pathname,
                window.location.search,
                window.location.hash,
            );
            window.location.assign(buildLoginRedirectUrl(currentPath));
        }

        return Promise.reject(error);
    }
);

export default api;
