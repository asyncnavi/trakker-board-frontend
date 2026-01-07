import axios from "axios";
export const BASE_URL = "http://localhost:4000/api";

export interface APIError {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface APIReponse<T> {
  success?: boolean;
  error?: APIError;
  data?: T;
}

export const client = axios.create({
  baseURL: BASE_URL,
});

export const authedClient = axios.create({
  baseURL: BASE_URL,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add token to pending requests queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Execute all pending requests with new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor - Add access token to headers
authedClient.interceptors.request.use(
  (config) => {
    // Get token from store (we'll need to import this)
    const token = localStorage.getItem("trakker-auth-store");
    if (token) {
      try {
        const parsedState = JSON.parse(token);
        const accessToken = parsedState?.state?.accessToken;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle 401 and refresh token
authedClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(authedClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const storedAuth = localStorage.getItem("trakker-auth-store");
        if (!storedAuth) {
          throw new Error("No refresh token available");
        }

        const parsedState = JSON.parse(storedAuth);
        const refreshToken = parsedState?.state?.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const { refreshToken: refreshTokenAPI } = await import("./auth");
        const response = await refreshTokenAPI({ refresh_token: refreshToken });

        if (response.data) {
          const { access_token, refresh_token } = response.data;

          // Update localStorage with new tokens
          parsedState.state.accessToken = access_token;
          parsedState.state.refreshToken = refresh_token;
          localStorage.setItem(
            "trakker-auth-store",
            JSON.stringify(parsedState),
          );

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Resolve all pending requests
          onRefreshed(access_token);
          isRefreshing = false;

          // Retry the original request
          return authedClient(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Clear auth and redirect to login
        localStorage.removeItem("trakker-auth-store");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
