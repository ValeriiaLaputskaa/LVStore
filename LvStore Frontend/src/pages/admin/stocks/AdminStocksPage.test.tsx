import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStocks } from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
import { AdminThemeProvider } from "../theme/AdminThemeContext";
import { AdminStocksPage } from "./AdminStocksPage";

jest.mock("../../../api/stocksApi", () => ({
  fetchStocks: jest.fn(),
  fetchCriticalStocksByStore: jest.fn(),
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

const product = { id: 1, name: "Молоко", category: "D", barcode: "111", price: 2 };
const store = { id: 7, name: "Точка А", location: "Львів" };

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <AdminThemeProvider>
            <AdminStocksPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

function setupCatalogMocks() {
  jest.mocked(fetchStores).mockResolvedValue([store]);
  jest.mocked(fetchProducts).mockResolvedValue([product]);
}

describe("AdminStocksPage", () => {
  it("renders filters and add stock action", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Немає записів залишків.")).toBeInTheDocument());
    expect(screen.getByRole("columnheader", { name: "Магазин" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Товар" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Додати залишок" })).toBeInTheDocument();
    expect(screen.getByText("Критичні залишки за магазином")).toBeInTheDocument();
  });

  it("shows empty state when there are no stocks", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Немає записів залишків.")).toBeInTheDocument();
    });
  });

  it("renders stock rows with product name, store and quantities", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockResolvedValue([
      {
        id: 11,
        quantity: 24,
        minQuantity: 5,
        product,
        store,
      },
    ]);
    renderPage();
    const table = screen.getByRole("table");
    await waitFor(() => expect(within(table).getByText("Молоко")).toBeInTheDocument());
    expect(within(table).getByText("Точка А")).toBeInTheDocument();
    expect(within(table).getByText("24")).toBeInTheDocument();
    expect(within(table).getByText("5")).toBeInTheDocument();
  });

  it("shows critical badge when quantity is at or below minQuantity", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockResolvedValue([
      {
        id: 12,
        quantity: 2,
        minQuantity: 5,
        product: { ...product, id: 2, name: "Сир" },
        store,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Критично")).toBeInTheDocument());
  });

  it("shows OK status when quantity is above minQuantity", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockResolvedValue([
      {
        id: 13,
        quantity: 10,
        minQuantity: 3,
        product: { ...product, id: 3, name: "Хліб" },
        store,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Хліб")).toBeInTheDocument());
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("shows error message when stocks fail to load", async () => {
    setupCatalogMocks();
    jest.mocked(fetchStocks).mockRejectedValue(new Error("fail"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Не вдалося завантажити залишки.")).toBeInTheDocument();
    });
  });
});
