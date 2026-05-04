import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getCurrentUser, getGoogleOAuthAuthorizationUrl, login } from "../../api/authApi";
import { LoginPage } from "./LoginPage";

const mockGoogleUrl = "http://localhost:8080/oauth2/authorization/google";

jest.mock("../../api/authApi", () => ({
  login: jest.fn(),
  getCurrentUser: jest.fn(),
  getGoogleOAuthAuthorizationUrl: jest.fn(() => mockGoogleUrl),
}));

function renderLoginAt(initialPath = "/login") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: "/login", element: <LoginPage /> },
      {
        path: "/admin/dashboard",
        element: <div data-testid="dest-admin">Admin dest</div>,
      },
      {
        path: "/seller/products",
        element: <div data-testid="dest-seller">Seller dest</div>,
      },
      {
        path: "/warehouse/dashboard",
        element: <div data-testid="dest-warehouse">Warehouse dest</div>,
      },
    ],
    { initialEntries: [initialPath] },
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  it("renders login heading and fields", () => {
    renderLoginAt();
    expect(screen.getByRole("heading", { name: "Вхід" })).toBeInTheDocument();
    expect(screen.getByTestId("login-email")).toBeInTheDocument();
    expect(screen.getByTestId("login-password")).toBeInTheDocument();
    expect(screen.getByTestId("login-submit")).toBeInTheDocument();
    expect(screen.getByTestId("login-google")).toBeInTheDocument();
    expect(screen.getByText("or continue with")).toBeInTheDocument();
  });

  it("shows OAuth error when redirected with oauth2=access_denied", () => {
    renderLoginAt("/login?oauth2=access_denied");
    expect(screen.getByTestId("login-form-error")).toBeInTheDocument();
    expect(screen.getByText(/Вхід через Google неможливий/i)).toBeInTheDocument();
  });

  it("requires terms before starting Google login", async () => {
    const user = userEvent.setup();
    const assignSpy = jest.spyOn(window.location, "assign").mockImplementation(() => {});
    renderLoginAt();
    await user.click(screen.getByTestId("login-google"));
    expect(await screen.findByText("Потрібно погодитися з умовами використання.")).toBeInTheDocument();
    expect(assignSpy).not.toHaveBeenCalled();
    assignSpy.mockRestore();
  });

  it("navigates to Google OAuth URL when terms accepted and Google clicked", async () => {
    const user = userEvent.setup();
    const assignSpy = jest.spyOn(window.location, "assign").mockImplementation(() => {});
    renderLoginAt();
    await user.click(screen.getByRole("button", { name: /Погоджуюсь з умовами/i }));
    await user.click(screen.getByTestId("login-google"));
    expect(getGoogleOAuthAuthorizationUrl).toHaveBeenCalled();
    expect(assignSpy).toHaveBeenCalledWith(mockGoogleUrl);
    assignSpy.mockRestore();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderLoginAt();
    await user.click(screen.getByTestId("login-submit"));
    expect(await screen.findByText("Вкажіть email")).toBeInTheDocument();
    expect(screen.getByText("Вкажіть пароль")).toBeInTheDocument();
  });

  it("runs login then getCurrentUser and redirects by role", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    jest.mocked(login).mockResolvedValue({ token: "cookie-set-by-server" });
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 1,
      email: "admin@gmail.com",
      username: "admin",
      role: "STORE_ADMINISTRATOR",
    });

    renderLoginAt();
    await user.type(screen.getByTestId("login-email"), "admin@gmail.com");
    await user.type(screen.getByTestId("login-password"), "admin123");
    await user.click(screen.getByRole("button", { name: /Погоджуюсь з умовами/i }));
    await user.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "admin@gmail.com",
        password: "admin123",
      });
    });
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    });
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });
    await waitFor(() => {
      expect(screen.getByTestId("dest-admin")).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it("shows wrong credentials message on 401", async () => {
    const user = userEvent.setup();
    const err = new AxiosError("Unauthorized");
    err.response = {
      status: 401,
      data: {},
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
    };
    jest.mocked(login).mockRejectedValue(err);

    renderLoginAt();
    await user.type(screen.getByTestId("login-email"), "x@y.z");
    await user.type(screen.getByTestId("login-password"), "bad");
    await user.click(screen.getByRole("button", { name: /Погоджуюсь з умовами/i }));
    await user.click(screen.getByTestId("login-submit"));

    expect(
      await screen.findByText("Невірний email або пароль", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("login-form-error")).toBeInTheDocument();
  });
});
