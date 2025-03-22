import { API_URL } from "../../utils/constants";
import {
  Configuration,
  DefaultApi,
  Middleware,
  ResponseContext,
  RequestContext,
  JwtResponseDto,
  AuthResponseDtoFromJSON,
  ErrorResponseFromJSON,
} from "../../../generated";
import {store} from "../../store";
import {clearAuth, setAccessToken} from "../../store/auth";
import {REFRESH_TOKEN_KEY} from "../auth/authProvider";
import * as runtime from "../../../generated/runtime";

class TokenRefreshMiddleware implements Middleware {
  private refreshInProgress: Promise<string | undefined> | null = null;

  async post(context: ResponseContext): Promise<Response | void> {
    if (context.response && context.response.status === 401) {
      if (!this.refreshInProgress) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          store.dispatch(clearAuth());
          return context.response;
        }
        this.refreshInProgress = this.refreshAccessToken(refreshToken);
        console.log("[OpenAPI client] Refreshing access token...");
      }

      try {
        const newAccessToken = await this.refreshInProgress;
        console.log('newAccessToken ', newAccessToken)
        const newHeaders = new Headers(context.init.headers);
        newHeaders.set('Authorization', `Bearer ${newAccessToken}`);

        const retriedInit = {
          ...context.init,
          headers: newHeaders
        };

        return fetch(context.url, retriedInit);
      } catch (refreshError) {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        store.dispatch(clearAuth());
        window.location.href = '/login';
        throw refreshError;
      } finally {
        this.refreshInProgress = null;
      }
    }

    if (context.response.status < 200 || context.response.status >= 300) {
      const dto = await (new runtime.JSONApiResponse(context.response,
        (jsonValue) => ErrorResponseFromJSON(jsonValue))).value();
      throw new Error(dto.error);
    }

    return context.response;
  }

  private async refreshAccessToken(refreshToken: string): Promise<string | undefined> {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: refreshToken
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await response.json() as JwtResponseDto;
    store.dispatch(setAccessToken(accessToken));
    return accessToken;
  }
}

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

const apiConfig = new Configuration({
  basePath: API_URL,
  accessToken: async () => {
    return store.getState().auth.accessToken || "";
  },
  middleware: [
    new TokenRefreshMiddleware(),
    // loggingMiddleware,
  ],
});

export const api = new DefaultApi(apiConfig);

export default api;
