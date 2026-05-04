import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import { AxiosError } from "axios";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";
import { SellerAuthGuard } from "./SellerAuthGuard";

jest.mock("../../api/authApi", () => ({
  getCurrentUser: jest.fn(),
}));

function renderGuard(initialPath = "/seller/products") {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        path: "/seller",
        element: <SellerAuthGuard />,
        children: [
          {
            path: "products",
            element: <div data-testid="seller-in">Seller OK</div>,
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

describe("SellerAuthGuard", () => {
  it("shows loading state while checking auth", () => {
    jest.mocked(getCurrentUser).mockImplementation(() => new Promise(() => {}));
    renderGuard();
    expect(screen.queryByTestId("seller-in")).not.toBeInTheDocument();
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

  it("redirects non-seller to home", async () => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 1,
      email: "admin@gmail.com",
      username: "admin",
      role: "STORE_ADMINISTRATOR",
    });
    renderGuard();
    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("renders child for SELLER", async () => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 2,
      email: "seller@x.y",
      username: "seller",
      role: "SELLER",
    });
    renderGuard();
    await waitFor(() => {
      expect(screen.getByTestId("seller-in")).toBeInTheDocument();
    });
  });
});
