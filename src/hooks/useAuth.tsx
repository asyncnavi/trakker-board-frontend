import { useUserQuery } from "@/services/user";
import useAuthStore from "@/store/auth";

export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuthStore();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUserQuery({
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const isLoading = authLoading || (isAuthenticated && userLoading);
  const error = authError || (userError ? userError.message : null);

  return {
    isAuthenticated,
    user: user || null,
    isLoading,
    error,
    refetchUser,
  };
};
