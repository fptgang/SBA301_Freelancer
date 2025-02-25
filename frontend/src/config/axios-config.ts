import axios from "axios";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "../authProvider";
import { API_URL } from "../utils/constants";
import { Configuration, DefaultApi } from "../../generated";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure API client for token refresh
const apiConfig = new Configuration({
  basePath: API_URL,
});
const api = new DefaultApi(apiConfig);

// Add request interceptor to automatically add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Get the original request configuration
    const originalRequest = error.config;

    // Only attempt token refresh if:
    // 1. Response status is 401 (Unauthorized)
    // 2. The request exists and hasn't been retried yet
    // 3. We have a refresh token available
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      localStorage.getItem(REFRESH_TOKEN_KEY)
    ) {
      try {
        // Mark request as being retried to prevent infinite loops
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        // Call token refresh API
        const response = await api.refreshToken({ body: refreshToken });
        
        if (response?.accessToken && response?.refreshToken) {
          // Store new tokens
          localStorage.setItem(TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          
          // Update authorization header for the original request
          originalRequest.headers["Authorization"] = `Bearer ${response.accessToken}`;
          
          // Retry original request with new token
          return axiosInstance(originalRequest);
        } else {
          // Token refresh response was invalid
          throw new Error("Invalid token refresh response");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // Clear authentication data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        
        // Redirect to login (depending on application context, this might be handled differently)
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }
    
    // For 401 errors where refresh token failed or isn't available
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      
      // Only redirect if this wasn't a login attempt
      if (!originalRequest?.url?.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;