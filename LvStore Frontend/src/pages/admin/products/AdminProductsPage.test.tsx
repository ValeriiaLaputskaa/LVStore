import "@testing-library/jest-dom/jest-globals";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import { AdminProductsPage } from "./AdminProductsPage";
import { AdminThemeProvider } from "../theme/AdminThemeContext";

jest.mock("../../../api/productsApi", () => ({
  fetchProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
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
            <AdminProductsPage />
          </AdminThemeProvider>
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>,
  );
}

describe("AdminProductsPage", () => {
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
        name: "Test Product",
        category: "Cat",
        barcode: "123",
        price: 10.5,
        description: "d",
      },
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("123")).toBeInTheDocument();
    });
  });

  it("opens delete confirmation", async () => {
    const user = userEvent.setup();
    jest.mocked(fetchProducts).mockResolvedValue([
      {
        id: 9,
        name: "Del Me",
        category: "C",
        barcode: "999",
        price: 1,
      },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Del Me")).toBeInTheDocument());
    await user.click(screen.getAllByRole("button", { name: "Видалити" })[0]);
    expect(await screen.findByText("Видалити товар?")).toBeInTheDocument();
  });

  it("validates required fields in modal", async () => {
    const user = userEvent.setup();
    jest.mocked(fetchProducts).mockResolvedValue([]);
    renderPage();
    await user.click(screen.getByRole("button", { name: "Додати товар" }));
    await user.click(await screen.findByRole("button", { name: "Зберегти" }));
    await waitFor(() => {
      expect(screen.getByText(/Заповніть обов’язкові поля/i)).toBeInTheDocument();
    });
  });
});
