import type { AuthProvider } from "@refinedev/core";
import { API_URL } from "./utils/constants";

import {
  AccountDtoRoleEnum,
  AuthResponseDto,
  Configuration,
  DefaultApi,
  ResetPasswordRequestDto,
} from "../generated";
export const TOKEN_KEY = "refine-auth";
const config: Configuration = new Configuration({
  basePath: API_URL,
});
export const REFRESH_TOKEN_KEY = "refine-refresh-token";
const api = new DefaultApi(config);
export const authProvider: AuthProvider = {
  login: async ({ username, email, password, googleToken }) => {
    if (googleToken) {
      const normalizedToken = googleToken.replace('"', "");
      const response = await api.loginWithGoogle({ body: googleToken });
      localStorage.setItem(TOKEN_KEY, response.token ?? "");
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
      console.log(response);
      localStorage.setItem("role", response?.accountResponseDTO?.role ?? "");
      if (response?.accountResponseDTO?.role === AccountDtoRoleEnum.Admin) {
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
      const response: AuthResponseDto = await api.login({
        loginRequestDto: { email: email, password: password },
      });
      localStorage.setItem(TOKEN_KEY, response.token ?? "");
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
      console.log(response);
      localStorage.setItem("role", response.accountResponseDTO?.role ?? "");

      if (response.accountResponseDTO?.role === AccountDtoRoleEnum.Admin) {
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
      const checkStatus = await api
        .getCurrentUser({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response);
          if (response.role) {
            localStorage.setItem("role", response.role);
          }
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
      const result = await api
        .getCurrentUser({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response);
          if (response.role) {
            localStorage.setItem("role", response.role);
          }
          return {
            id: response.accountId,
            name: response.firstName + " " + response.lastName,
            avatar: response.avatarUrl ?? "https://i.pravatar.cc/300",
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
    const result = await api
      .register({
        registerRequestDto: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          confirmPassword: data.confirmPassword,
        },
      })
      .then(() => {
        return {
          success: true,
          redirectTo: "/login",
        };
      })
      .catch(() => {
        return {
          success: false,
          error: {
            name: "RegisterError",
            message: "Invalid username or password",
          },
        };
      });
    return result;
  },
  updatePassword: async (params: ResetPasswordRequestDto) => {
    if (params.token) {
      console.log("reset password");
      api
        .resetPassword({
          resetPasswordRequestDto: {
            token: params.token,
            newPassword: params.newPassword,
            confirmPassword: params.confirmPassword,
          },
        })
        .then(() => {
          return {
            success: true,
            redirectTo: "/login",
          };
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
    const response = api.forgotPassword(params.email);
    const result = response
      .then(() => {
        return {
          success: true,
          redirectTo: "/forgot-password",
        };
      })
      .catch(() => {
        return {
          success: false,
          redirectTo: "/forgot-password",
        };
      });

    return result;
  },
};
