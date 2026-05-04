import type { CollapsedNavIconKind } from "../admin/collapsedNavKinds";

export type SellerNavItem = {
  to: string;
  label: string;
  pageTitle: string;
  icon: CollapsedNavIconKind;
};

export const SELLER_NAV: SellerNavItem[] = [
  { to: "/seller/dashboard", label: "Огляд", pageTitle: "Огляд", icon: "overview" },
  { to: "/seller/products", label: "Товари", pageTitle: "Товари", icon: "products" },
  { to: "/seller/stocks", label: "Залишки", pageTitle: "Залишки", icon: "shopStocks" },
  { to: "/seller/orders", label: "Замовлення", pageTitle: "Замовлення", icon: "orders" },
];

export function sellerPageTitle(pathname: string): string {
  const hit = SELLER_NAV.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return hit?.pageTitle ?? "Кабінет продавця";
}
