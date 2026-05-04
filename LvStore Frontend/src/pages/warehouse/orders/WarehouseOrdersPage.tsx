import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  NativeSelectField,
  NativeSelectRoot,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { cancelOrder, fetchOrders, shipOrder } from "../../../api/ordersApi";
import { OrderStatus } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../../admin/components/AdminTablePagination";
import {
  adminNativeSelectFieldProps,
  adminTableColumnHeaderProps,
  useAdminTheme,
  useAdminThemeTokens,
} from "../../admin/theme/AdminThemeContext";

const STATUSES: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.CONFIRMED,
  OrderStatus.CANCELLED,
  OrderStatus.SHIPPED,
  OrderStatus.RECEIVED,
];

const STATUS_STYLE: Record<
  OrderStatus,
  { bg: string; color: string; borderColor: string }
> = {
  [OrderStatus.NEW]: { bg: "#DBEAFE", color: "#1E3A8A", borderColor: "#BFDBFE" },
  [OrderStatus.CONFIRMED]: {
    bg: "#CCFBF1",
    color: "#115E59",
    borderColor: "#99F6E4",
  },
  [OrderStatus.CANCELLED]: {
    bg: "#FEE2E2",
    color: "#991B1B",
    borderColor: "#FECACA",
  },
  [OrderStatus.SHIPPED]: { bg: "#FFF7ED", color: "#9A3412", borderColor: "#FED7AA" },
  [OrderStatus.RECEIVED]: {
    bg: "#D1FAE5",
    color: "#065F46",
    borderColor: "#A7F3D0",
  },
};

const actionBtnBase = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("uk-UA");
  } catch {
    return iso ?? "—";
  }
}

export function WarehouseOrdersPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const storeOptions = useMemo(() => {
    const rows = ordersQ.data ?? [];
    const map = new Map<number, string>();
    for (const o of rows) {
      const id = o.store?.id;
      if (id == null) continue;
      const name = o.store?.name?.trim() || `Магазин #${id}`;
      map.set(id, name);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [ordersQ.data]);

  const filtered = useMemo(() => {
    let rows = ordersQ.data ?? [];
    if (statusFilter) rows = rows.filter((o) => o.status === statusFilter);
    if (storeFilter) rows = rows.filter((o) => String(o.store?.id ?? "") === storeFilter);
    return rows;
  }, [ordersQ.data, statusFilter, storeFilter]);

  const totalFiltered = filtered.length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when filters change (admin pattern)
    setPage(1);
  }, [statusFilter, storeFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page to new total
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [filtered, page]);

  const shipMut = useMutation({
    mutationFn: (id: number) => shipOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      await qc.invalidateQueries({ queryKey: ["warehouse-stocks"] });
    },
  });
  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const onActionErr = (e: unknown) =>
    setActionError(getApiErrorMessage(e, "Операція не виконана. Перевірте статус замовлення."));

  const canCancel = (status: OrderStatus) =>
    status !== OrderStatus.CANCELLED && status !== OrderStatus.RECEIVED;

  return (
    <Box>
      {actionError ? (
        <Text color="red.600" fontSize="sm" mb={3}>
          {actionError}
        </Text>
      ) : null}
      <Flex direction={{ base: "column", md: "row" }} gap={3} mb={4} flexWrap="wrap" align={{ base: "stretch", md: "flex-end" }}>
        <Field.Root maxW={{ md: "200px" }}>
          <Field.Label fontSize="xs" color={t.headingText}>
            Статус
          </Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActionError(null);
              }}
              {...adminNativeSelectFieldProps(t, isDark)}
            >
              <option value="">Усі</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
        <Field.Root maxW={{ md: "240px" }}>
          <Field.Label fontSize="xs" color={t.headingText}>
            Магазин
          </Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setActionError(null);
              }}
              {...adminNativeSelectFieldProps(t, isDark)}
            >
              <option value="">Усі</option>
              {storeOptions.map(([id, name]) => (
                <option key={id} value={String(id)}>
                  {name} (#{id})
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
      </Flex>

      {ordersQ.isError ? <Text color="red.600">Не вдалося завантажити замовлення.</Text> : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Статус</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Товар</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Магазин</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Кількість</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Створено</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Автор</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {ordersQ.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="20px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!ordersQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={8}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає замовлень для відображення.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!ordersQ.isPending &&
                pagedRows.map((o) => {
                  const st = STATUS_STYLE[o.status];
                  return (
                    <Table.Row key={o.id}>
                      <Table.Cell>{o.id}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          px={2}
                          py={0.5}
                          rounded="md"
                          borderWidth="1px"
                          fontSize="11px"
                          fontWeight="semibold"
                          textTransform="none"
                          lineHeight="1"
                          bg={st.bg}
                          color={st.color}
                          borderColor={st.borderColor}
                        >
                          {o.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{o.product?.name ?? "—"}</Table.Cell>
                      <Table.Cell>{o.store?.name ?? "—"}</Table.Cell>
                      <Table.Cell>{o.quantity}</Table.Cell>
                      <Table.Cell whiteSpace="nowrap">{formatDt(o.createdAt)}</Table.Cell>
                      <Table.Cell>{o.createdBy?.username ?? "—"}</Table.Cell>
                      <Table.Cell>
                        <Flex gap={1} flexWrap="wrap" maxW="200px">
                          {o.status === OrderStatus.CONFIRMED ? (
                            <Button
                              {...actionBtnBase}
                              variant="solid"
                              bg="#FEF3C7"
                              color="#92400E"
                              _hover={{ bg: "#FDE68A" }}
                              loading={shipMut.isPending}
                              onClick={() =>
                                shipMut.mutate(o.id, {
                                  onError: onActionErr,
                                })
                              }
                            >
                              Відправити
                            </Button>
                          ) : null}
                          {canCancel(o.status) ? (
                            <Button
                              {...actionBtnBase}
                              variant="solid"
                              bg="#FEE2E2"
                              color="#B91C1C"
                              _hover={{ bg: "#FECACA" }}
                              loading={cancelMut.isPending}
                              onClick={() =>
                                cancelMut.mutate(o.id, {
                                  onError: onActionErr,
                                })
                              }
                            >
                              Скасувати
                            </Button>
                          ) : null}
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table.Root>
        </Box>
        {!ordersQ.isPending && totalFiltered > 0 ? (
          <AdminTablePagination
            page={page}
            pageSize={ADMIN_TABLE_PAGE_SIZE}
            total={totalFiltered}
            onPageChange={setPage}
            itemsLabel="замовлень"
          />
        ) : null}
      </Box>
    </Box>
  );
}
