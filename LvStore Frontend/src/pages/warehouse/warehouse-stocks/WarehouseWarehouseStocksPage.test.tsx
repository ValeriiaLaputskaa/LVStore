import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import {
  deleteWarehouseStock,
  fetchWarehouseStocks,
} from "../../../api/warehouseStocksApi";
import { fetchWarehouses } from "../../../api/warehousesApi";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { WarehouseWarehouseStocksPage } from "./WarehouseWarehouseStocksPage";

jest.mock("../../../api/warehouseStocksApi", () => ({
  fetchWarehouseStocks: jest.fn(),
  createWarehouseStock: jest.fn(),
  updateWarehouseStock: jest.fn(),
  deleteWarehouseStock: jest.fn(),
}));

jest.mock("../../../api/warehousesApi", () => ({
  fetchWarehouses: jest.fn(),
}));

jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
}));

const warehouse = { id: 3, name: "Склад Схід", location: "Одеса" };
const product = { id: 9, name: "Кава", category: "Напої", barcode: "c1", price: 100 };

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <AdminThemeProvider>
            <WarehouseWarehouseStocksPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

function setupMocks() {
  jest.mocked(fetchWarehouses).mockResolvedValue([warehouse]);
  jest.mocked(fetchProducts).mockResolvedValue([product]);
}

describe("WarehouseWarehouseStocksPage", () => {
  it("renders filters and add button", async () => {
    setupMocks();
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Немає записів. Додайте залишок або змініть фільтри.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("columnheader", { name: "Склад" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Товар" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Додати залишок" })).toBeInTheDocument();
  });

  it("shows empty state when there are no warehouse stocks", async () => {
    setupMocks();
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Немає записів. Додайте залишок або змініть фільтри.")).toBeInTheDocument();
    });
  });

  it("renders rows with warehouse name, product name and quantity", async () => {
    setupMocks();
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([
      {
        id: 501,
        warehouse,
        product,
        quantity: 42,
      },
    ]);
    renderPage();
    const table = screen.getByRole("table");
    await waitFor(() => expect(within(table).getByText("Склад Схід")).toBeInTheDocument());
    expect(within(table).getByText("Кава")).toBeInTheDocument();
    expect(within(table).getByText("42")).toBeInTheDocument();
  });

  it("shows only edit, delete and add actions available in the UI", async () => {
    setupMocks();
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([
      {
        id: 502,
        warehouse,
        product,
        quantity: 1,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Змінити" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Видалити" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Додати залишок" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Підтвердити" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Нове замовлення" })).not.toBeInTheDocument();
  });

  it("opens ConfirmDialog and calls deleteWarehouseStock when delete is confirmed", async () => {
    const user = userEvent.setup();
    setupMocks();
    jest.mocked(deleteWarehouseStock).mockResolvedValue(undefined);
    jest.mocked(fetchWarehouseStocks).mockResolvedValue([
      {
        id: 601,
        warehouse,
        product,
        quantity: 5,
      },
    ]);
    renderPage();
    const table = screen.getByRole("table");
    await waitFor(() => expect(within(table).getByText("Кава")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Видалити" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Видалити запис?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Видалити" }));
    await waitFor(() => expect(deleteWarehouseStock).toHaveBeenCalledWith(601));
  });

  it("shows error message when warehouse stocks fail to load", async () => {
    setupMocks();
    jest.mocked(fetchWarehouseStocks).mockRejectedValue(new Error("fail"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Не вдалося завантажити складські залишки.")).toBeInTheDocument();
    });
  });
});
