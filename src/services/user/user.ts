import { authedClient } from "../index";
import type { APIReponse } from "../index";
import type { UpdateUserRequestFields, User } from "./user.types";

export const getCurrentUser = async (): Promise<User> => {
  const response = await authedClient.get<APIReponse<User>>("/users/me");

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to fetch user");
  }

  if (!response.data.data) {
    throw new Error("No user data returned");
  }

  return response.data.data;
};

export const updateUser = async (
  data: UpdateUserRequestFields,
): Promise<User> => {
  const response = await authedClient.patch<APIReponse<User>>(
    "/users/me",
    data,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message || "Failed to update user");
  }

  if (!response.data.data) {
    throw new Error("No user data returned");
  }

  return response.data.data;
};
