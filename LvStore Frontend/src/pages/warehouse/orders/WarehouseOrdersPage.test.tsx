import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchOrders } from "../../../api/ordersApi";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { OrderStatus } from "../../../types";
import { WarehouseOrdersPage } from "./WarehouseOrdersPage";

jest.mock("../../../api/ordersApi", () => ({
  fetchOrders: jest.fn(),
  shipOrder: jest.fn(),
  cancelOrder: jest.fn(),
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
            <WarehouseOrdersPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

const baseProduct = { id: 1, name: "P", category: "C", barcode: "1", price: 1 };
const baseStore = { id: 10, name: "Store A", location: "L" };
const baseUser = { id: 5, username: "u", email: "e@e", role: "SELLER" as const };

describe("WarehouseOrdersPage", () => {
  it("shows Відправити only for CONFIRMED", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 1,
        status: OrderStatus.CONFIRMED,
        quantity: 2,
        createdAt: "2024-01-01T00:00:00Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
      {
        id: 2,
        status: OrderStatus.NEW,
        quantity: 1,
        createdAt: "2024-01-01T00:00:00Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Відправити")).toBeInTheDocument());
    const shipButtons = screen.getAllByRole("button", { name: "Відправити" });
    expect(shipButtons).toHaveLength(1);
  });

  it("does not show admin/seller-only order actions", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 1,
        status: OrderStatus.CONFIRMED,
        quantity: 1,
        createdAt: "2024-01-01T00:00:00Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Відправити")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Нове замовлення" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Підтвердити" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Отримано" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Змінити" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Видалити" })).not.toBeInTheDocument();
  });

  it("hides Скасувати for CANCELLED and RECEIVED", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 1,
        status: OrderStatus.CANCELLED,
        quantity: 1,
        createdAt: "2024-01-01T00:00:00Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
      {
        id: 2,
        status: OrderStatus.RECEIVED,
        quantity: 1,
        createdAt: "2024-01-01T00:00:00Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("CANCELLED")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Скасувати" })).not.toBeInTheDocument();
  });
});
