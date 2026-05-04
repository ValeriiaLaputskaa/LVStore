import { isAxiosError } from "axios";

export function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Невірний email або пароль";
    }
    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.response == null
    ) {
      return "Не вдалося підключитися до сервера. Спробуйте пізніше.";
    }
  }
  return "Не вдалося підключитися до сервера. Спробуйте пізніше.";
}
