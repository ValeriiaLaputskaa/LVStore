import { Box, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStocks } from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
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
  t: ReturnType<typeof useAdminThemeTokens>;
}) {
  return (
    <Box bg={t.surface} borderWidth="1px" borderColor={t.surfaceBorder} rounded="md" p={4}>
      <Text fontSize="xs" color={t.mutedText} mb={1}>
        {label}
      </Text>
      {loading ? (
        <Skeleton height="28px" width="80px" />
      ) : (
        <Text fontSize="2xl" fontWeight="semibold" color={t.headingText}>
          {value}
        </Text>
      )}
    </Box>
  );
}

export function SellerOverviewPage() {
  const t = useAdminThemeTokens();
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });

  const criticalCount = useMemo(() => {
    const rows = stocksQ.data ?? [];
    return rows.filter((s) => s.quantity <= s.minQuantity).length;
  }, [stocksQ.data]);

  const loading = productsQ.isPending || ordersQ.isPending || stocksQ.isPending || storesQ.isPending;

  return (
    <Box>
      <Text color={t.mutedText} fontSize="sm" mb={4}>
        Короткий огляд доступних даних. Деталі — у відповідних розділах.
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        <StatCard label="Товарів" value={productsQ.data?.length ?? 0} loading={loading} t={t} />
        <StatCard label="Замовлень" value={ordersQ.data?.length ?? 0} loading={loading} t={t} />
        <StatCard label="Записів залишків" value={stocksQ.data?.length ?? 0} loading={loading} t={t} />
        <StatCard label="Критичних залишків" value={criticalCount} loading={loading} t={t} />
      </SimpleGrid>
      <Box mt={4}>
        <StatCard label="Магазинів" value={storesQ.data?.length ?? 0} loading={loading} t={t} />
      </Box>
    </Box>
  );
}
