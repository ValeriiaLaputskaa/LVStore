import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data && typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
    const status = error.response?.status;
    if (status === 401) return "Потрібна авторизація.";
    if (status === 403) return "Недостатньо прав для цієї дії.";
    if (status === 404) return "Не знайдено.";
    if (status === 409) return "Конфлікт даних (наприклад, дубль штрихкоду).";
  }
  return fallback;
}
