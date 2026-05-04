import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { fetchOrders } from "../../api/ordersApi";
import {
  FALLBACK_ORDER_STATUS_COUNTS,
  orderStatusCountsFromOrders,
} from "./mainPageFallbackData";

async function landingSafe<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403)) {
      return [] as T;
    }
    throw e;
  }
}

export function useMainLandingQueries() {
  const ordersQ = useQuery({
    queryKey: ["main", "orders"],
    queryFn: () => landingSafe(fetchOrders),
  });

  const orders = ordersQ.data ?? [];

  const orderStatusCounts =
    orders.length > 0 ? orderStatusCountsFromOrders(orders) : FALLBACK_ORDER_STATUS_COUNTS;

  return {
    isLoading: ordersQ.isPending,
    orderStatusCounts,
  };
}
