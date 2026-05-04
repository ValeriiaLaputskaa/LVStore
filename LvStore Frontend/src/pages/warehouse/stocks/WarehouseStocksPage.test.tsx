import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStocks } from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { WarehouseStocksPage } from "./WarehouseStocksPage";

jest.mock("../../../api/stocksApi", () => ({
  fetchStocks: jest.fn(),
  createStock: jest.fn(),
  updateStock: jest.fn(),
  deleteStock: jest.fn(),
}));

jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
}));

jest.mock("../../../api/storesApi", () => ({
  fetchStores: jest.fn(),
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
            <WarehouseStocksPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("WarehouseStocksPage", () => {
  it("does not call GET /stores", async () => {
    jest.mocked(fetchStocks).mockResolvedValue([
      {
        id: 1,
        quantity: 2,
        minQuantity: 5,
        product: { id: 1, name: "Milk", category: "D", barcode: "1", price: 1 },
        store: { id: 7, name: "Shop", location: "K" },
      },
    ]);
    jest.mocked(fetchProducts).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Milk")).toBeInTheDocument());
    expect(fetchStores).not.toHaveBeenCalled();
  });

  it("shows critical badge when quantity <= minQuantity", async () => {
    jest.mocked(fetchStocks).mockResolvedValue([
      {
        id: 1,
        quantity: 1,
        minQuantity: 3,
        product: { id: 1, name: "X", category: "D", barcode: "1", price: 1 },
        store: { id: 2, name: "S", location: "L" },
      },
    ]);
    jest.mocked(fetchProducts).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Критично")).toBeInTheDocument());
  });
});
