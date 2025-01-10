import type { AuthProvider } from "@refinedev/core";
import {
  getCurrentUser,
  login,
  loginWithGoogle,
  register,
} from "./data/service/auth-service";
export const TOKEN_KEY = "refine-auth";
export const REFRESH_TOKEN_KEY = "refine-refresh-token";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password, googleToken }) => {
    if (googleToken) {
      const response = await loginWithGoogle(googleToken);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      return {
        success: true,
        redirectTo: "/",
      };
    }

    if ((username || email) && password) {
      const response = await login(email, password);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token: string | null = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const checkStatus = await getCurrentUser(token)
        .then((response) => {
          console.log(response);
          return {
            authenticated: true,
          };
        })
        .catch((error) => {
          console.log(error);
          return {
            authenticated: false,
            redirectTo: "/login",
          };
        });
      return checkStatus;
    }
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    return ["admin"];
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const result = await getCurrentUser(token)
        .then((response) => {
          console.log(response);
          return {
            id: response.accountId,
            name: response.firstName + " " + response.lastName,
            avatar: "https://i.pravatar.cc/300",
          };
        })
        .catch((error) => {
          console.log(error);
          return null;
        });
      return result;
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  register: async (data: any) => {
    const response = await register(data);
    if (response) {
      return {
        success: true,
        redirectTo: "/login",
      };
    }
    return {
      success: true,
      redirectTo: "/login",
    };
  },
};
