import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://sticky-list.onrender.com"; // Production
// const BASE_URL = "http://localhost:5000"; // Dev - Replace with your backend URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Access-Control-Allow-Origin'] = '*'; // Add CORS header
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Here you could add token refresh logic if your backend supports it
        // For now, we'll just clear the invalid token
        await AsyncStorage.removeItem('token');
        
        // You might want to navigate to login screen here
        // This would require additional setup with a navigation ref
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      throw new Error('Network error - please check your internet connection');
    }
    
    // Handle other errors
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      config: error.config
    });
    
    return Promise.reject(error);
  }
);

// Helper function to set token after login
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
    // Update the default header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting token:', error);
    throw error;
  }
};

// Helper function to clear token on logout
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error clearing token:', error);
    throw error;
  }
};

export default api;