import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateUser } from "./user";
import type { UpdateUserRequestFields } from "./user.types";

// Query Keys
export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// Query Hook
export const useUserQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: options?.enabled ?? true,
  });
};

// Mutation Hooks
export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserRequestFields) => updateUser(data),
    onSuccess: (data) => {
      // Update the cache with new user data
      queryClient.setQueryData(userKeys.me(), data);
      // Invalidate to ensure all components refresh
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });

  return {
    updateUser: updateUserMutation,
  };
};
