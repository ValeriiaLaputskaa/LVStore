import type { AuthUser, LoginRequest, LoginResponse } from "../types";
import { axiosInstance, getApiBaseUrl } from "./axiosInstance";

export function getGoogleOAuthAuthorizationUrl(): string {
  return `${getApiBaseUrl()}/oauth2/authorization/google`;
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>("/auth/token", body);
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}
