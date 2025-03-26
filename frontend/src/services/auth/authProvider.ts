import type { AuthProvider } from "@refinedev/core";

import {
  AccountDto,
  AccountDtoRoleEnum,
  AuthResponseDto,
  ResetPasswordRequestDto,
} from "../../../generated";
import api from "../api/openapi-config";
import {store} from "../../store";
import {clearAuth, setAccessToken, setAuthenticatedAccount} from "../../store/auth";

export const REFRESH_TOKEN_KEY = "refine-refresh-token";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password, googleToken }) => {
    try {
      if (googleToken) {
        const response = await api.loginWithGoogle({body: googleToken});
        console.log(response);

        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
        store.dispatch(setAccessToken(response.token));
        store.dispatch(setAuthenticatedAccount(response.accountResponseDTO));

        return {
          success: true,
          redirectTo: (response?.accountResponseDTO?.role === AccountDtoRoleEnum.Admin ||
            response?.accountResponseDTO?.role === AccountDtoRoleEnum.Staff
          ) ? "/admin" : "/",
        };
      }

      if ((username || email) && password) {
        const response: AuthResponseDto = await api.login({
          loginRequestDto: {email: email, password: password},
        });
        console.log(response);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
        store.dispatch(setAccessToken(response.token));
        store.dispatch(setAuthenticatedAccount(response.accountResponseDTO));

        return {
          success: true,
          redirectTo: (response?.accountResponseDTO?.role === AccountDtoRoleEnum.Admin ||
            response?.accountResponseDTO?.role === AccountDtoRoleEnum.Staff
          ) ? "/admin" : "/",
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: e.toString(),
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    store.dispatch(clearAuth());
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    if (authProvider.getIdentity && await authProvider.getIdentity()) {
      return { authenticated: true }
    } else {
      return {
        authenticated: false,
        //redirectTo: "/login",
        error: {
          message: "Check failed",
          name: "Not authenticated"
        }
      }
    }
  },
  getPermissions: async () => {
    return store.getState().auth.account?.role;
  },
  getIdentity: async (refetch = false) : Promise<AccountDto | undefined>=> {
    // Force fetching if on first load, there is refresh token
    if (refetch || (!store.getState().auth.account && localStorage.getItem(REFRESH_TOKEN_KEY))) {
      console.log("[authProvider.getIdentity] fetching user profile...");
      try {
        const response = await api.getCurrentUser()
        console.log(response);
        store.dispatch(setAuthenticatedAccount(response));
      } catch (e) {
        return {
          success: false,
          error: {
            name: "GetIdentityError",
            message: e.toString(),
          },
        };
      }
    }

    return store.getState().auth.account;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  register: async (data) => {
    try {
      if (data.googleToken) {
        await api.registerWithGoogle({
          registerWithGoogleRequest: {
            credential: data.googleToken,
            role: data.role
          },
        });
      } else {
        await api
          .register({
            registerRequestDto: {
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              confirmPassword: data.confirmPassword,
              role: data.role
            },
          });
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (e) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: e.toString(),
        },
      };
    }
  },
  updatePassword: async (params: ResetPasswordRequestDto) => {
    if (params.token) {
      try {
        await api
          .resetPassword({
            resetPasswordRequestDto: {
              token: params.token,
              newPassword: params.newPassword,
              confirmPassword: params.confirmPassword,
            },
          });
        return {
          success: true,
          redirectTo: "/login",
        };
      } catch (e) {
        return {
          success: false,
          error: {
            name: "RegisterError",
            message: e.toString(),
          },
        };
      }
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  forgotPassword: async (params) => {
    try {
      await api.forgotPassword({
        forgotPasswordRequestDto: {email: params.email},
      });
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (e) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: e.toString(),
        },
      };
    }
  },
};
