import axios from 'axios';
import { store } from '../store';
import { showNotification } from '../store/slices/notificationsSlice';
import { ErrorTypes, getErrorType, getErrorMessage } from '../utils/errorHandling';

const api = axios.create({
  baseURL: 'http://localhost:5004/api',
  timeout: 10000,
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

    // Dispatch notification for error feedback
    store.dispatch(showNotification({
      type: 'error',
      message: errorMessage
    }));

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

// Add request retry functionality
api.interceptors.response.use(undefined, async error => {
  const config = error.config;

  // Only retry on network errors or 5xx server errors
  if (
    !config || 
    !config.retry || 
    config.retry >= 3 ||
    (error.response && error.response.status < 500)
  ) {
    return Promise.reject(error);
  }

  // Increase retry count
  config.retry = (config.retry || 0) + 1;

  // Delay each retry attempt
  const delay = config.retry * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry the request
  return api(config);
});

export default api;
