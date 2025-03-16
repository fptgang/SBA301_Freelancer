import axios from "axios";
import {REFRESH_TOKEN_KEY} from "../authProvider";
import {store} from "../store";
import {API_URL} from "../utils/constants";
import {JwtResponseDto} from "../../generated";
import {clearAuth, setAccessToken} from "../store/auth";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error
    ) => {
        console.error("Response Error:", error);
        const originalRequest = error.config;
        //add a check if it is cors error just dont retry refresh token or retry
        if(error.message === "Network Error"){
            return Promise.reject(error);
        }
        if (
            (error.response?.status === 401) ||
            (error.code === "ERR_NETWORK" && error.config?.headers?.Authorization)
        ) {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            if (refreshToken) {
                try {
                    console.log("[Axios client] Refreshing access token...");
                    originalRequest._retry = true;

                    const response = await fetch(`${API_URL}/auth/refresh-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: refreshToken
                    });

                    if (response.ok) {
                        const {accessToken} = await response.json() as JwtResponseDto;

                        if (accessToken) {
                            store.dispatch(setAccessToken(accessToken));
                            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                            return axiosInstance(originalRequest);
                        }
                    }
                } catch (refreshError) {
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    store.dispatch(clearAuth());
                    //window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
