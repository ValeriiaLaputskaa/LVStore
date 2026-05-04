import type { CollapsedNavIconKind } from "./collapsedNavKinds";

export type AdminNavItem = {
  to: string;
  label: string;
  pageTitle: string;
  icon: CollapsedNavIconKind;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin/dashboard", label: "Огляд", pageTitle: "Огляд", icon: "overview" },
  { to: "/admin/products", label: "Товари", pageTitle: "Товари", icon: "products" },
  { to: "/admin/orders", label: "Замовлення", pageTitle: "Замовлення", icon: "orders" },
  {
    to: "/admin/stores-users",
    label: "Магазини та користувачі",
    pageTitle: "Магазини та користувачі",
    icon: "storesUsers",
  },
  {
    to: "/admin/stocks",
    label: "Залишки",
    pageTitle: "Залишки на складах магазинів",
    icon: "shopStocks",
  },
];

export function adminPageTitle(pathname: string): string {
  const hit = ADMIN_NAV.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return hit?.pageTitle ?? "Панель";
}
