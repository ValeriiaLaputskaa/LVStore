import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchCriticalStocksByStore, fetchStocks } from "../../../api/stocksApi";
import { fetchWarehouseStocks } from "../../../api/warehouseStocksApi";
import { fetchWarehouses } from "../../../api/warehousesApi";
import { OrderStatus } from "../../../types";
import type { AdminThemeTokens } from "../../admin/theme/AdminThemeContext";
import { useAdminThemeTokens } from "../../admin/theme/AdminThemeContext";

function StatCard({
  label,
  value,
  loading,
  t,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  t: AdminThemeTokens;
}) {
  return (
    <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} p={5} shadow="sm">
      <Text fontSize="sm" color={t.mutedText} mb={1}>
        {label}
      </Text>
      {loading ? (
        <Skeleton height="32px" width="80px" />
      ) : (
        <Text fontSize="2xl" fontWeight="bold" color={t.headingText}>
          {value}
        </Text>
      )}
    </Box>
  );
}

export function WarehouseOverviewPage() {
  const t = useAdminThemeTokens();
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const warehousesQ = useQuery({ queryKey: ["warehouses"], queryFn: fetchWarehouses });
  const warehouseStocksQ = useQuery({
    queryKey: ["warehouse-stocks"],
    queryFn: fetchWarehouseStocks,
  });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });

  const confirmedToShip =
    ordersQ.data?.filter((o) => o.status === OrderStatus.CONFIRMED).length ?? 0;

  const storeIds = [...new Set((stocksQ.data ?? []).map((s) => s.store?.id).filter(Boolean))] as number[];

  const criticalQueries = useQueries({
    queries: storeIds.map((storeId) => ({
      queryKey: ["stocks", "critical", storeId],
      queryFn: () => fetchCriticalStocksByStore(storeId),
      enabled: storeIds.length > 0 && !stocksQ.isPending,
    })),
  });

  const criticalLoading = stocksQ.isPending || criticalQueries.some((q) => q.isPending);
  const criticalCount = criticalQueries.reduce((acc, q) => acc + (q.data?.length ?? 0), 0);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" color={t.headingText} mb={4}>
        Огляд складу
      </Text>
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
      >
        <StatCard
          label="Усі замовлення"
          value={ordersQ.data?.length ?? 0}
          loading={ordersQ.isPending}
          t={t}
        />
        <StatCard
          label="До відправлення (CONFIRMED)"
          value={confirmedToShip}
          loading={ordersQ.isPending}
          t={t}
        />
        <StatCard
          label="Склади"
          value={warehousesQ.data?.length ?? 0}
          loading={warehousesQ.isPending}
          t={t}
        />
        <StatCard
          label="Складські залишки (записи)"
          value={warehouseStocksQ.data?.length ?? 0}
          loading={warehouseStocksQ.isPending}
          t={t}
        />
        <StatCard
          label="Товари"
          value={productsQ.data?.length ?? 0}
          loading={productsQ.isPending}
          t={t}
        />
        <StatCard
          label="Залишки в магазинах (записи)"
          value={stocksQ.data?.length ?? 0}
          loading={stocksQ.isPending}
          t={t}
        />
        <StatCard
          label="Критичні залишки в магазинах"
          value={storeIds.length === 0 && !stocksQ.isPending ? "—" : criticalCount}
          loading={criticalLoading}
          t={t}
        />
      </Grid>
    </Box>
  );
}
