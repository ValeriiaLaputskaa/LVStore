import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { getCurrentUser } from "../../../api/authApi";
import { fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStores } from "../../../api/storesApi";
import { OrderStatus } from "../../../types";
import { AdminThemeProvider } from "../../admin/theme/AdminThemeContext";
import { SellerOrdersPage } from "./SellerOrdersPage";

jest.mock("../../../api/authApi", () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock("../../../api/ordersApi", () => ({
  fetchOrders: jest.fn(),
  createOrder: jest.fn(),
  deliverOrder: jest.fn(),
  updateOrder: jest.fn(),
  deleteOrder: jest.fn(),
}));
jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
}));
jest.mock("../../../api/storesApi", () => ({
  fetchStores: jest.fn(),
}));

const baseProduct = { id: 1, name: "P", category: "C", barcode: "1", price: 1 };
const baseStore = { id: 1, name: "S", location: "L" };
const baseUser = { id: 9, username: "seller", email: "s@x.y", role: "SELLER" as const };

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <AdminThemeProvider>
            <SellerOrdersPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

function mockOrder(over: Partial<{ id: number; status: OrderStatus }> = {}) {
  return {
    id: over.id ?? 1,
    status: over.status ?? OrderStatus.NEW,
    quantity: 1,
    createdAt: "2026-01-01T10:00:00",
    product: baseProduct,
    store: baseStore,
    createdBy: baseUser,
  };
}

describe("SellerOrdersPage", () => {
  beforeEach(() => {
    jest.mocked(getCurrentUser).mockResolvedValue({
      id: 9,
      email: "s@x.y",
      username: "seller",
      role: "SELLER",
    });
    jest.mocked(fetchProducts).mockResolvedValue([baseProduct]);
    jest.mocked(fetchStores).mockResolvedValue([baseStore]);
  });

  it("shows deliver only for SHIPPED", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([
      mockOrder({ id: 1, status: OrderStatus.NEW }),
      mockOrder({ id: 2, status: OrderStatus.SHIPPED }),
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("SHIPPED")).toBeInTheDocument());
    const deliverButtons = screen.getAllByRole("button", { name: "Підтвердити отримання" });
    expect(deliverButtons).toHaveLength(1);
  });

  it("does not show admin-only order actions", async () => {
    jest.mocked(fetchOrders).mockResolvedValue([mockOrder({ id: 1, status: OrderStatus.NEW })]);
    renderPage();
    await waitFor(() => expect(screen.getByText("NEW")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /^Видалити$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Змінити$/ })).not.toBeInTheDocument();
    const confirmOrderBtn = screen.queryAllByRole("button").find((b) => b.textContent === "Підтвердити");
    expect(confirmOrderBtn).toBeUndefined();
  });
});
