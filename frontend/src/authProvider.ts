import type { AuthProvider } from "@refinedev/core";
import {
  forgotPassword,
  getCurrentUser,
  login,
  loginWithGoogle,
  register,
  resetPassword,
} from "./data/service/auth-service";
import { Auth } from "./data/types/auth";
import { Role } from "./data/types/Account";
import { l } from "react-router/dist/development/fog-of-war-DLtn2OLr";
export const TOKEN_KEY = "refine-auth";
export const REFRESH_TOKEN_KEY = "refine-refresh-token";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password, googleToken }) => {
    if (googleToken) {
      const response = await loginWithGoogle(googleToken);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      console.log(response);
      localStorage.setItem("role", response.accountResponseDTO.role);
      if (response.accountResponseDTO.role === Role.ADMIN) {
        return {
          success: true,
          redirectTo: "/admin",
        };
      } else {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    }

    if ((username || email) && password) {
      const response: Auth = await login(email, password);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      console.log(response);
      localStorage.setItem("role", response.accountResponseDTO.role);

      if (response.accountResponseDTO.role === Role.ADMIN) {
        return {
          success: true,
          redirectTo: "/admin",
        };
      } else {
        return {
          success: true,
          redirectTo: "/",
        };
      }
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
    console.log("check auth " + token);
    if (token) {
      const checkStatus = await getCurrentUser(token)
        .then((response) => {
          console.log(response);
          localStorage.setItem("role", response.role);
          console.log(response);
          return {
            role: response.role,
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
    return localStorage.getItem("role");
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const result = await getCurrentUser(token)
        .then((response) => {
          console.log(response);
          localStorage.setItem("role", response.role);
          return {
            id: response.accountId,
            name: response.firstName + " " + response.lastName,
            avatar: "https://i.pravatar.cc/300",
            role: response.role,
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
  register: async (data) => {
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
  updatePassword: async (params: ResetPasswordRequestDTO) => {
    if (params.token) {
      console.log("reset password");
      resetPassword({
        token: params.token,
        newPassword: params.newPassword,
        confirmPassword: params.confirmPassword,
      });
    } else {
      console.log("update password");
    }

    console.log(params);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  forgotPassword: async (params) => {
    console.log(params);
    const response = await forgotPassword(params.email);

    if (response.status === 200) {
      return {
        success: true,
        redirectTo: "/login",
      };
    }
    return {
      success: false,
      redirectTo: "/forgot-password",
    };
  },
};

export interface ResetPasswordRequestDTO {
  token: string | undefined;
  oldPassword: string | undefined;
  newPassword: string;
  confirmPassword: string;
}
