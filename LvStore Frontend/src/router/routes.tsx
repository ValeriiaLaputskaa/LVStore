import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AdminAuthGuard } from "../pages/admin/AdminAuthGuard";
import { AdminShell } from "../pages/admin/AdminShell";
import { AdminOverviewPage } from "../pages/admin/dashboard/AdminOverviewPage";
import { AdminOrdersPage } from "../pages/admin/orders/AdminOrdersPage";
import { AdminProductsPage } from "../pages/admin/products/AdminProductsPage";
import { AdminStocksPage } from "../pages/admin/stocks/AdminStocksPage";
import { AdminStoresUsersPage } from "../pages/admin/stores-users/AdminStoresUsersPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { MainPage } from "../pages/main/MainPage";
import { SellerAuthGuard } from "../pages/seller/SellerAuthGuard";
import { SellerShell } from "../pages/seller/SellerShell";
import { SellerOverviewPage } from "../pages/seller/dashboard/SellerOverviewPage";
import { SellerOrdersPage } from "../pages/seller/orders/SellerOrdersPage";
import { SellerProductsPage } from "../pages/seller/products/SellerProductsPage";
import { SellerStocksPage } from "../pages/seller/stocks/SellerStocksPage";
import { WarehouseAuthGuard } from "../pages/warehouse/WarehouseAuthGuard";
import { WarehouseShell } from "../pages/warehouse/WarehouseShell";
import { WarehouseOverviewPage } from "../pages/warehouse/dashboard/WarehouseOverviewPage";
import { WarehouseOrdersPage } from "../pages/warehouse/orders/WarehouseOrdersPage";
import { WarehouseProductsPage } from "../pages/warehouse/products/WarehouseProductsPage";
import { WarehouseStocksPage } from "../pages/warehouse/stocks/WarehouseStocksPage";
import { WarehouseWarehouseStocksPage } from "../pages/warehouse/warehouse-stocks/WarehouseWarehouseStocksPage";
import { WarehouseWarehousesPage } from "../pages/warehouse/warehouses/WarehouseWarehousesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [{ index: true, element: <MainPage /> }],
  },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/seller",
    element: <SellerAuthGuard />,
    children: [
      {
        element: <SellerShell />,
        children: [
          { index: true, element: <Navigate to="products" replace /> },
          { path: "dashboard", element: <SellerOverviewPage /> },
          { path: "products", element: <SellerProductsPage /> },
          { path: "stocks", element: <SellerStocksPage /> },
          { path: "orders", element: <SellerOrdersPage /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminAuthGuard />,
    children: [
      {
        element: <AdminShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminOverviewPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "stores-users", element: <AdminStoresUsersPage /> },
          { path: "stocks", element: <AdminStocksPage /> },
        ],
      },
    ],
  },
  {
    path: "/warehouse",
    element: <WarehouseAuthGuard />,
    children: [
      {
        element: <WarehouseShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <WarehouseOverviewPage /> },
          { path: "orders", element: <WarehouseOrdersPage /> },
          { path: "warehouses", element: <WarehouseWarehousesPage /> },
          { path: "warehouse-stocks", element: <WarehouseWarehouseStocksPage /> },
          { path: "products", element: <WarehouseProductsPage /> },
          { path: "stocks", element: <WarehouseStocksPage /> },
        ],
      },
    ],
  },
]);
