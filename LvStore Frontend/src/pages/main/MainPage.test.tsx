import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React, { type ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

jest.mock("../../api/ordersApi", () => ({
  fetchOrders: jest.fn(() => Promise.resolve([])),
}));

import { MainPage } from "./MainPage";

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: "/", element: ui }],
    { initialEntries: ["/"] },
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("MainPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<MainPage />);
    expect(document.querySelector("[data-figma-node='119-2']")).toBeTruthy();
  });

  it("shows key Ukrainian copy from the Figma frame", () => {
    const { getByText, getAllByText } = renderWithProviders(<MainPage />);
    expect(getByText("Система управління мережею магазинів")).toBeInTheDocument();
    expect(getByText("Ваш бізнес —")).toBeInTheDocument();
    expect(getByText("500+")).toBeInTheDocument();
    expect(getByText("Магазинів у системі")).toBeInTheDocument();
    expect(getByText("Усе, що потрібно для роботи")).toBeInTheDocument();
    expect(document.body.textContent).toContain("Жодне замовлення не");
    expect(document.body.textContent).toContain("загубиться");
    expect(getAllByText("LvStore").length).toBeGreaterThan(0);
  });
});
