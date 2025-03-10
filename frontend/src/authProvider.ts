import type { AuthProvider } from "@refinedev/core";

import {
  AccountDto,
  AccountDtoRoleEnum,
  AuthResponseDto,
  ResetPasswordRequestDto,
} from "../generated";
import api from "./config/openapi-config";
import {store} from "./store";
import {clearAuth, setAccessToken, setAuthenticatedAccount} from "./store/auth";

export const REFRESH_TOKEN_KEY = "refine-refresh-token";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password, googleToken }) => {
    if (googleToken) {
      const response = await api.loginWithGoogle({body: googleToken});
      console.log(response);

      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
      store.dispatch(setAccessToken(response.token));
      store.dispatch(setAuthenticatedAccount(response.accountResponseDTO));

      return {
        success: true,
        redirectTo: response?.accountResponseDTO?.role === AccountDtoRoleEnum.Admin ? "/admin" : "/",
      };
    }

    if ((username || email) && password) {
      const response: AuthResponseDto = await api.login({
        loginRequestDto: { email: email, password: password },
      });
      console.log(response);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken ?? "");
      store.dispatch(setAccessToken(response.token));
      store.dispatch(setAuthenticatedAccount(response.accountResponseDTO));

      return {
        success: true,
        redirectTo: response?.accountResponseDTO?.role === AccountDtoRoleEnum.Admin ? "/admin" : "/",
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
        redirectTo: "/login",
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
      await api.getCurrentUser()
        .then((response: AccountDto) => {
          console.log(response);
          store.dispatch(setAuthenticatedAccount(response));
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return store.getState().auth.account;
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
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  forgotPassword: async (params) => {
    const response = api.forgotPassword({
      forgotPasswordRequestDto: { email: params.email },
    });
    const result = response
      .then(() => {
        return {
          success: true,
          redirectTo: "/login",
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