import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStocks } from "../../../api/stocksApi";
import { fetchWarehouseStocks } from "../../../api/warehouseStocksApi";
import { fetchWarehouses } from "../../../api/warehousesApi";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { WarehouseOverviewPage } from "./WarehouseOverviewPage";

jest.mock("../../../api/ordersApi", () => ({ fetchOrders: jest.fn() }));
jest.mock("../../../api/warehousesApi", () => ({ fetchWarehouses: jest.fn() }));
jest.mock("../../../api/warehouseStocksApi", () => ({ fetchWarehouseStocks: jest.fn() }));
jest.mock("../../../api/productsApi", () => ({ fetchProducts: jest.fn() }));
jest.mock("../../../api/stocksApi", () => ({
  fetchStocks: jest.fn(),
  fetchCriticalStocksByStore: jest.fn(async () => []),
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
            <WarehouseOverviewPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("WarehouseOverviewPage", () => {
  it("renders overview labels", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([]);
    jest.mocked(fetchWarehouses).mockResolvedValue([]);
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([]);
    jest.mocked(fetchProducts).mockResolvedValue([]);
    jest.mocked(fetchStocks).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Огляд складу")).toBeInTheDocument();
      expect(screen.getByText("Усі замовлення")).toBeInTheDocument();
      expect(screen.getByText("Складські залишки (записи)")).toBeInTheDocument();
    });
  });
});
