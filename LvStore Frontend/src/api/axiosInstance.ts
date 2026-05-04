import axios from "axios";

export function getApiBaseUrl(): string {
  const env = import.meta.env;
  const fromBase = env.VITE_API_BASE_URL;
  const fromLegacy = env.VITE_API_URL;
  if (typeof fromBase === "string" && fromBase.trim() !== "") {
    return fromBase.trim();
  }
  if (typeof fromLegacy === "string" && fromLegacy.trim() !== "") {
    return fromLegacy.trim();
  }
  return "http://localhost:8080";
}

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});
