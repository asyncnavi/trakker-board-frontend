import { create } from "zustand";
import { persist } from "zustand/middleware";
import { startLogin, verifyLogin } from "@/services/auth";
import type { AxiosError } from "axios";
import type { APIError } from "@/services";
import { queryClient } from "@/lib/query-client";

type AuthStore = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;

  startLogin: (email: string) => Promise<boolean>;
  verifyLogin: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,

      startLogin: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await startLogin({ email });

          if (response.error) {
            set({
              error: response.error.message || "Failed to start login",
              isLoading: false,
            });
            return false;
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ error: APIError }>;
          set({
            error:
              axiosError.response?.data?.error?.message ||
              axiosError.message ||
              "An error occurred",
            isLoading: false,
          });
          return false;
        }
      },

      verifyLogin: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await verifyLogin({ email, otp });

          if (response.error) {
            set({
              error: response.error.message || "Failed to verify login",
              isLoading: false,
            });
            return false;
          }

          if (response.data) {
            set({
              isAuthenticated: true,
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
              isLoading: false,
              error: null,
            });
            return true;
          }
          return false;
        } catch (error) {
          const axiosError = error as AxiosError<{ error: APIError }>;
          set({
            error:
              axiosError.response?.data?.error?.message ||
              axiosError.message ||
              "An error occurred",
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
        // Clear React Query cache
        queryClient.clear();
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "trakker-auth-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

export default useAuthStore;
