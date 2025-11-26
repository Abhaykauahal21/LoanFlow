import axios from 'axios';
import { store } from '../store';
import { showNotification } from '../store/slices/notificationsSlice';
import { ErrorTypes, getErrorType, getErrorMessage } from '../utils/errorHandling';

const api = axios.create({
  // Use relative path so Vite proxy (client/vite.config.js) forwards to backend
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Handle successful responses
    return response;
  },
  error => {
    const errorType = getErrorType(error);
    const errorMessage = getErrorMessage(error);

    // Only show toast notifications for non-auth errors
    if (errorType !== ErrorTypes.AUTHENTICATION_ERROR && errorType !== ErrorTypes.AUTHORIZATION_ERROR) {
      store.dispatch(showNotification({
        type: 'error',
        message: errorMessage
      }));
    }

    // Handle specific error types
    switch (errorType) {
      case ErrorTypes.AUTHENTICATION_ERROR:
        // Clear token and redirect to login if token is invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;

      case ErrorTypes.AUTHORIZATION_ERROR:
        // Handle forbidden access
        console.warn('Access denied:', errorMessage);
        break;

      case ErrorTypes.NETWORK_ERROR:
        // Handle network issues
        console.error('Network error:', errorMessage);
        break;

      case ErrorTypes.SERVER_ERROR:
        // Log server errors
        console.error('Server error:', errorMessage);
        break;

      default:
        // Log other errors
        console.error('API error:', {
          type: errorType,
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data
        });
    }

    // Log all errors for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('API Error Details');
      console.error('Error Type:', errorType);
      console.error('Error Message:', errorMessage);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Config:', error.config);
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

// Add request retry functionality (simple retry for network/5xx errors)
api.interceptors.response.use(undefined, async error => {
  const config = error.config;

  if (!config) {
    return Promise.reject(error);
  }

  // Initialize retry tracking
  config.__retryCount = config.__retryCount || 0;
  const maxRetries = config.__maxRetries || 2;

  const status = error.response?.status;
  const isRetryable = !status || (status >= 500 && status < 600);

  if (!isRetryable || config.__retryCount >= maxRetries) {
    return Promise.reject(error);
  }

  config.__retryCount += 1;

  // Exponential backoff
  const delay = Math.pow(2, config.__retryCount) * 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  return api(config);
});

export default api;
