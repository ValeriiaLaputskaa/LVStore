import type { CollapsedNavIconKind } from "../admin/collapsedNavKinds";

export type WarehouseNavItem = {
  to: string;
  label: string;
  icon: CollapsedNavIconKind;
};

export const WAREHOUSE_NAV: WarehouseNavItem[] = [
  { to: "/warehouse/dashboard", label: "Огляд", icon: "overview" },
  { to: "/warehouse/orders", label: "Замовлення", icon: "orders" },
  { to: "/warehouse/warehouses", label: "Склади", icon: "warehouses" },
  { to: "/warehouse/warehouse-stocks", label: "Складські залишки", icon: "warehouseStocks" },
  { to: "/warehouse/products", label: "Товари", icon: "products" },
  { to: "/warehouse/stocks", label: "Залишки магазинів", icon: "shopStocks" },
];

export function warehousePageTitle(pathname: string): string {
  const hit = WAREHOUSE_NAV.find((item) => pathname === item.to);
  return hit?.label ?? "Склад LvStore";
}
