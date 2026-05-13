import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { getCurrentUser } from "../../../api/authApi";
import {
  cancelOrder,
  confirmOrder,
  deleteOrder,
  fetchOrders,
} from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStores } from "../../../api/storesApi";
import { fetchUsers } from "../../../api/usersApi";
import { OrderStatus } from "../../../types";
import { AdminThemeProvider } from "../theme/AdminThemeContext";
import { AdminOrdersPage } from "./AdminOrdersPage";

jest.mock("../../../api/authApi", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../../../api/ordersApi", () => ({
  fetchOrders: jest.fn(),
  confirmOrder: jest.fn(),
  cancelOrder: jest.fn(),
  createOrder: jest.fn(),
  deleteOrder: jest.fn(),
  deliverOrder: jest.fn(),
  updateOrder: jest.fn(),
}));

jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
}));

jest.mock("../../../api/storesApi", () => ({
  fetchStores: jest.fn(),
}));

jest.mock("../../../api/usersApi", () => ({
  fetchUsers: jest.fn(),
}));

const adminUser = {
  id: 1,
  email: "admin@test.ua",
  username: "admin",
  role: "STORE_ADMINISTRATOR" as const,
};

const baseProduct = { id: 1, name: "Товар А", category: "C", barcode: "b1", price: 10 };
const baseStore = { id: 10, name: "Магазин Центр", location: "Київ" };
const baseUser = { id: 5, username: "seller1", email: "s@test.ua", role: "SELLER" as const };

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <AdminThemeProvider>
            <AdminOrdersPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

function setupDefaultMocks() {
  jest.mocked(getCurrentUser).mockResolvedValue(adminUser);
  jest.mocked(fetchStores).mockResolvedValue([baseStore]);
  jest.mocked(fetchProducts).mockResolvedValue([baseProduct]);
  jest.mocked(fetchUsers).mockResolvedValue([baseUser]);
}

describe("AdminOrdersPage", () => {
  it("renders filters and new order action", async () => {
    setupDefaultMocks();
    jest.mocked(fetchOrders).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Немає замовлень.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Нове замовлення" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Статус" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Магазин" })).toBeInTheDocument();
  });

  it("shows empty state when there are no orders", async () => {
    setupDefaultMocks();
    jest.mocked(fetchOrders).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Немає замовлень.")).toBeInTheDocument();
    });
  });

  it("renders order rows with product, store and quantity after successful fetch", async () => {
    setupDefaultMocks();
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 101,
        status: OrderStatus.CONFIRMED,
        quantity: 3,
        createdAt: "2024-06-01T12:00:00.000Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    const table = screen.getByRole("table");
    await waitFor(() => expect(within(table).getByText("Товар А")).toBeInTheDocument());
    expect(within(table).getByText("Магазин Центр")).toBeInTheDocument();
    expect(within(table).getByText("3")).toBeInTheDocument();
    expect(within(table).getByText("CONFIRMED")).toBeInTheDocument();
  });

  it("shows confirm, cancel, edit and delete for NEW orders", async () => {
    setupDefaultMocks();
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 201,
        status: OrderStatus.NEW,
        quantity: 1,
        createdAt: "2024-06-02T10:00:00.000Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Підтвердити" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Скасувати" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Змінити" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Видалити" })).toBeInTheDocument();
  });

  it("calls confirmOrder when Підтвердити is clicked", async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    jest.mocked(confirmOrder).mockResolvedValue(undefined);
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 301,
        status: OrderStatus.NEW,
        quantity: 2,
        createdAt: "2024-06-03T08:00:00.000Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Підтвердити" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Підтвердити" }));
    await waitFor(() => expect(confirmOrder).toHaveBeenCalledWith(301));
  });

  it("calls cancelOrder when Скасувати is clicked", async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    jest.mocked(cancelOrder).mockResolvedValue(undefined);
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 302,
        status: OrderStatus.NEW,
        quantity: 1,
        createdAt: "2024-06-03T09:00:00.000Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Скасувати" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Скасувати" }));
    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith(302));
  });

  it("opens ConfirmDialog and calls deleteOrder when delete is confirmed", async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    jest.mocked(deleteOrder).mockResolvedValue(undefined);
    jest.mocked(fetchOrders).mockResolvedValue([
      {
        id: 401,
        status: OrderStatus.CONFIRMED,
        quantity: 1,
        createdAt: "2024-06-04T10:00:00.000Z",
        product: baseProduct,
        store: baseStore,
        createdBy: baseUser,
      },
    ]);
    renderPage();
    const table = screen.getByRole("table");
    await waitFor(() => expect(within(table).getByText("Товар А")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Видалити" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Видалити замовлення?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Видалити" }));
    await waitFor(() => expect(deleteOrder).toHaveBeenCalledWith(401));
  });

  it("shows error message when orders fail to load", async () => {
    setupDefaultMocks();
    jest.mocked(fetchOrders).mockRejectedValue(new Error("network"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Не вдалося завантажити замовлення.")).toBeInTheDocument();
    });
  });
});
