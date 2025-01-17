import { API_URL } from "../utils/constants";
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from "../authProvider";
import {
  Configuration,
  DefaultApi,
  Middleware,
  ResponseContext,
  RequestContext,
} from "../../generated";

// Authentication middleware
const authMiddleware: Middleware = {
  pre: async (context: RequestContext) => {
    // Add token to request headers
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      context.init.headers = {
        ...context.init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return context;
  },
  post: async (context: ResponseContext) => {
    // Handle 401 errors and token refresh
    if (context.response.status === 401) {
      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refresh) {
        try {
          // Get new tokens
          const tokens = await api.refreshToken({
            body: refresh,
          });

          // Update localStorage
          localStorage.setItem(TOKEN_KEY, tokens.accessToken ?? "");
          localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken ?? "");

          // Retry the original request with new token
          const originalRequest = context.init;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
          };

          // Create new request with updated token
          const response = await fetch(context.url, originalRequest);
          return response;
        } catch (error) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = "/login";
          throw error;
        }
      }
    }
    return context.response;
  },
};

// Logging middleware
const loggingMiddleware: Middleware = {
  pre: async (context: RequestContext) => {
    console.log("Request:", {
      url: context.url,
      method: context.init.method,
      headers: context.init.headers,
    });
    return context;
  },
  post: async (context: ResponseContext) => {
    console.log("Response:", {
      status: context.response.status,
      statusText: context.response.statusText,
    });
    return context.response;
  },
};

// Create API client configuration
const apiConfig = new Configuration({
  basePath: API_URL,
  accessToken: localStorage.getItem(TOKEN_KEY) ?? undefined,
  middleware: [authMiddleware, loggingMiddleware],
});

// Create API instance
export const api = new DefaultApi(apiConfig);

export default api;
