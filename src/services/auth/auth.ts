import { client } from "../index";
import type {
  RefreshTokenRequestFields,
  RefreshTokenResponseFields,
  StartLoginRequestFields,
  StartLoginResponseFields,
  VerifyLoginRequestFields,
  VerifyLoginResponseFields,
} from "./auth.types";
import type { APIReponse } from "../index";

export const startLogin = async (
  data: StartLoginRequestFields,
): Promise<APIReponse<StartLoginResponseFields>> => {
  const response = await client.post<APIReponse<StartLoginResponseFields>>(
    "/auth/email/start",
    data,
  );
  return response.data;
};

export const verifyLogin = async (
  data: VerifyLoginRequestFields,
): Promise<APIReponse<VerifyLoginResponseFields>> => {
  const response = await client.post<APIReponse<VerifyLoginResponseFields>>(
    "/auth/email/verify",
    data,
  );
  return response.data;
};

export const refreshToken = async (
  data: RefreshTokenRequestFields,
): Promise<APIReponse<RefreshTokenResponseFields>> => {
  const response = await client.post<APIReponse<RefreshTokenResponseFields>>(
    "/auth/refresh",
    data,
  );
  return response.data;
};
