import { OrderStatus, type Product, type Stock } from "../../types";

export type HeroTableStatus = "ok" | "critical";

export interface HeroInventoryRow {
  name: string;
  quantity: number;
  status: HeroTableStatus;
}

export interface HeroKpis {
  articleCount: number;
  criticalCount: number;
  ordersCount: number;
}

export const FALLBACK_HERO_KPIS: HeroKpis = {
  articleCount: 142,
  criticalCount: 7,
  ordersCount: 3,
};

export const FALLBACK_HERO_ROWS: HeroInventoryRow[] = [
  { name: "Навушники Sony WH", quantity: 23, status: "ok" },
  { name: "Кабель USB-C 2м", quantity: 3, status: "critical" },
  { name: "Планшет Samsung", quantity: 12, status: "ok" },
  { name: "Зарядний 65W GaN", quantity: 5, status: "critical" },
];

export const FALLBACK_ORDER_STATUS_COUNTS: Record<OrderStatus, number> = {
  [OrderStatus.NEW]: 12,
  [OrderStatus.CONFIRMED]: 8,
  [OrderStatus.SHIPPED]: 24,
  [OrderStatus.RECEIVED]: 156,
  [OrderStatus.CANCELLED]: 3,
};

export function buildHeroRowsFromApi(
  products: Product[],
  stocks: Stock[],
): HeroInventoryRow[] {
  if (!products.length || !stocks.length) return FALLBACK_HERO_ROWS;
  return stocks.slice(0, 4).map((s) => ({
    name: s.product.name,
    quantity: s.quantity,
    status: s.quantity <= s.minQuantity ? "critical" : "ok",
  }));
}

export function heroKpisFromStocks(stocks: Stock[]): HeroKpis {
  if (!stocks.length) return FALLBACK_HERO_KPIS;
  const criticalCount = stocks.filter((s) => s.quantity <= s.minQuantity).length;
  return {
    articleCount: stocks.length,
    criticalCount,
    ordersCount: FALLBACK_HERO_KPIS.ordersCount,
  };
}

export function orderStatusCountsFromOrders(
  orders: { status: OrderStatus }[],
): Record<OrderStatus, number> {
  if (!orders.length) return FALLBACK_ORDER_STATUS_COUNTS;
  const base: Record<OrderStatus, number> = {
    [OrderStatus.NEW]: 0,
    [OrderStatus.CONFIRMED]: 0,
    [OrderStatus.SHIPPED]: 0,
    [OrderStatus.RECEIVED]: 0,
    [OrderStatus.CANCELLED]: 0,
  };
  for (const o of orders) {
    base[o.status] += 1;
  }
  return base;
}
