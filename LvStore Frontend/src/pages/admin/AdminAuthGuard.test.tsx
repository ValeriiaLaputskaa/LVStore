import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import { AxiosError } from "axios";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";
import { AdminAuthGuard } from "./AdminAuthGuard";

jest.mock("../../api/authApi", () => ({
  getCurrentUser: jest.fn(),
}));

function renderGuard(initialPath = "/admin/dashboard") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        path: "/admin",
        element: <AdminAuthGuard />,
        children: [
          {
            path: "dashboard",
            element: <div data-testid="admin-in">Dashboard OK</div>,
          },
        ],
      },
      { path: "/login", element: <div data-testid="login-page">Login</div> },
      { path: "/", element: <div data-testid="home-page">Home</div> },
    ],
    { initialEntries: [initialPath] },
  );
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("AdminAuthGuard", () => {
  it("shows loading state while checking auth", () => {
    jest.mocked(getCurrentUser).mockImplementation(() => new Promise(() => {}));
    renderGuard();
    expect(screen.queryByTestId("admin-in")).not.toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
  });

  it("redirects to login on 401", async () => {
    const err = new AxiosError("Unauthorized");
    err.response = { status: 401, data: {}, statusText: "", headers: {}, config: {} as never };
    jest.mocked(getCurrentUser).mockRejectedValue(err);
    renderGuard();
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  it("redirects non-admin to home", async () => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 2,
      email: "s@x.y",
      username: "seller",
      role: "SELLER",
    });
    renderGuard();
    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("renders child for STORE_ADMINISTRATOR", async () => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 1,
      email: "admin@gmail.com",
      username: "admin",
      role: "STORE_ADMINISTRATOR",
    });
    renderGuard();
    await waitFor(() => {
      expect(screen.getByTestId("admin-in")).toBeInTheDocument();
    });
  });
});
