import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { SellerProductsPage } from "./SellerProductsPage";

jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
}));

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <AdminThemeProvider>
            <SellerProductsPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("SellerProductsPage", () => {
  it("shows empty state when no products", async () => {
    jest.mocked(fetchProducts).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Немає товарів для відображення.")).toBeInTheDocument();
    });
  });

  it("renders product rows", async () => {
    jest.mocked(fetchProducts).mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        category: "Dairy",
        barcode: "111",
        price: 2.5,
        description: "Fresh",
      },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Milk")).toBeInTheDocument();
      expect(screen.getByText("111")).toBeInTheDocument();
    });
  });

  it("filters by search on client", async () => {
    const user = userEvent.setup();
    jest.mocked(fetchProducts).mockResolvedValue([
      {
        id: 1,
        name: "Alpha",
        category: "C1",
        barcode: "b1",
        price: 1,
      },
      {
        id: 2,
        name: "Beta",
        category: "C2",
        barcode: "b2",
        price: 2,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    const search = screen.getByRole("search", {
      name: /Пошук за назвою, штрихкодом або категорією/i,
    });
    await user.type(search, "Beta");
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("does not show admin product actions", async () => {
    jest.mocked(fetchProducts).mockResolvedValue([
      { id: 1, name: "X", category: "C", barcode: "1", price: 1 },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("X")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Додати товар" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Змінити" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Видалити" })).not.toBeInTheDocument();
  });
});
