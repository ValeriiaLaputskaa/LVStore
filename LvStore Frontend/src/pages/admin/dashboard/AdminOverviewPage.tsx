import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchCriticalStocksByStore, fetchStocks } from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
import { fetchUsers } from "../../../api/usersApi";
import type { AdminThemeTokens } from "../theme/AdminThemeContext";
import { useAdminThemeTokens } from "../theme/AdminThemeContext";

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

export function AdminOverviewPage() {
  const t = useAdminThemeTokens();
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const usersQ = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });

  const storeIds = storesQ.data?.map((s) => s.id) ?? [];
  const criticalQueries = useQueries({
    queries: storeIds.map((storeId) => ({
      queryKey: ["stocks", "critical", storeId],
      queryFn: () => fetchCriticalStocksByStore(storeId),
      enabled: storeIds.length > 0 && !storesQ.isPending,
    })),
  });

  const criticalLoading =
    storesQ.isPending || criticalQueries.some((q) => q.isPending);
  const criticalCount = criticalQueries.reduce((acc, q) => acc + (q.data?.length ?? 0), 0);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" color={t.headingText} mb={4}>
        Загальна статистика
      </Text>
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
      >
        <StatCard
          label="Товари"
          value={productsQ.data?.length ?? 0}
          loading={productsQ.isPending}
          t={t}
        />
        <StatCard
          label="Замовлення"
          value={ordersQ.data?.length ?? 0}
          loading={ordersQ.isPending}
          t={t}
        />
        <StatCard
          label="Магазини"
          value={storesQ.data?.length ?? 0}
          loading={storesQ.isPending}
          t={t}
        />
        <StatCard
          label="Користувачі"
          value={usersQ.data?.length ?? 0}
          loading={usersQ.isPending}
          t={t}
        />
        <StatCard
          label="Записи залишків"
          value={stocksQ.data?.length ?? 0}
          loading={stocksQ.isPending}
          t={t}
        />
        <StatCard
          label="Критичні залишки (усі магазини)"
          value={storeIds.length === 0 && !storesQ.isPending ? "—" : criticalCount}
          loading={criticalLoading}
          t={t}
        />
      </Grid>
    </Box>
  );
}
