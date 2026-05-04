import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  NativeSelectField,
  NativeSelectRoot,
  Portal,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentUser } from "../../../api/authApi";
import { createOrder, deliverOrder, fetchOrders } from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStores } from "../../../api/storesApi";
import type { CreateOrderPayload } from "../../../types";
import { OrderStatus } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../../admin/components/AdminTablePagination";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
  adminNativeSelectFieldProps,
  adminTableColumnHeaderProps,
  adminThemedInputProps,
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

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("uk-UA");
  } catch {
    return iso ?? "—";
  }
}

export function SellerOrdersPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [cQuantity, setCQuantity] = useState("1");
  const [cProductId, setCProductId] = useState("");
  const [cStoreId, setCStoreId] = useState("");
  const [cCreatedAt, setCCreatedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const meQ = useQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser, staleTime: 30_000 });
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });

  useEffect(() => {
    const pid = (location.state as { productId?: number } | null)?.productId;
    if (pid != null && Number.isFinite(pid)) {
      setCProductId(String(pid));
      setCreateOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    let rows = ordersQ.data ?? [];
    if (statusFilter) {
      rows = rows.filter((o) => o.status === statusFilter);
    }
    if (storeFilter) {
      const sid = Number(storeFilter);
      rows = rows.filter((o) => o.store?.id === sid);
    }
    return rows;
  }, [ordersQ.data, statusFilter, storeFilter]);

  const totalFiltered = filtered.length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, storeFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [filtered, page]);

  const createMut = useMutation({
    mutationFn: (body: CreateOrderPayload) => createOrder(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setCreateOpen(false);
      setFormError(null);
    },
    onError: (e) => {
      setFormError(
        isAxiosError(e) && e.response?.status === 403
          ? "У вас немає доступу до цієї дії."
          : getApiErrorMessage(e, "Не вдалося створити замовлення."),
      );
    },
  });

  const deliverMut = useMutation({
    mutationFn: (id: number) => deliverOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setActionError(null);
    },
    onError: (e) => {
      setActionError(
        isAxiosError(e) && e.response?.status === 403
          ? "У вас немає доступу до цієї дії."
          : getApiErrorMessage(e, "Не вдалося підтвердити отримання."),
      );
    },
  });

  const onCreate = () => {
    const me = meQ.data;
    if (!me) {
      setFormError("Не вдалося отримати дані користувача.");
      return;
    }
    const qty = Number(cQuantity);
    const pid = Number(cProductId);
    const sid = Number(cStoreId);
    if (!Number.isFinite(qty) || qty < 1) {
      setFormError("Вкажіть коректну кількість.");
      return;
    }
    if (!Number.isFinite(pid) || !Number.isFinite(sid)) {
      setFormError("Оберіть товар і магазин.");
      return;
    }
    const createdAt = `${cCreatedAt}:00`;
    setFormError(null);
    createMut.mutate({
      status: OrderStatus.NEW,
      quantity: qty,
      createdAt,
      productId: pid,
      storeId: sid,
      creatorId: me.id,
    });
  };

  return (
    <Box>
      {actionError ? (
        <Text color="red.500" fontSize="sm" mb={3}>
          {actionError}
        </Text>
      ) : null}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={4}
        flexWrap="wrap"
        align={{ base: "stretch", md: "flex-end" }}
      >
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
        <Field.Root maxW={{ md: "220px" }}>
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
              {(storesQ.data ?? []).map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
        <Button colorPalette="blue" ml={{ md: "auto" }} onClick={() => setCreateOpen(true)}>
          Нове замовлення
        </Button>
      </Flex>

      {ordersQ.isError ? <Text color="red.500">Не вдалося завантажити замовлення.</Text> : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Статус</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Товар</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Магазин</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>К-сть</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Створено</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Автор</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {ordersQ.isPending
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="18px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!ordersQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={8}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає замовлень.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!ordersQ.isPending &&
                pagedRows.map((o) => (
                  <Table.Row key={o.id}>
                    <Table.Cell>{o.id}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        bg={STATUS_STYLE[o.status].bg}
                        color={STATUS_STYLE[o.status].color}
                        borderWidth="1px"
                        borderColor={STATUS_STYLE[o.status].borderColor}
                        rounded="full"
                        px="10px"
                        py="4px"
                        fontSize="11px"
                        fontWeight="semibold"
                        textTransform="none"
                        lineHeight="1"
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
                      {o.status === OrderStatus.SHIPPED ? (
                        <Button
                          size="sm"
                          colorPalette="blue"
                          loading={deliverMut.isPending}
                          onClick={() => deliverMut.mutate(o.id)}
                        >
                          Підтвердити отримання
                        </Button>
                      ) : (
                        <Text fontSize="xs" color={t.mutedText}>
                          —
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
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

      <Dialog.Root
        open={createOpen}
        onOpenChange={(d) => {
          setCreateOpen(d.open);
          if (!d.open) setFormError(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>Нове замовлення</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.500" fontSize="sm" mb={2}>
                    {formError}
                  </Text>
                ) : null}
                <Text fontSize="sm" color={t.mutedText} mb={3}>
                  Статус буде <b>NEW</b>. Автор — поточний продавець.
                </Text>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Кількість *</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={cQuantity}
                    onChange={(e) => setCQuantity(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Товар *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={cProductId}
                      onChange={(e) => setCProductId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      <option value="">Оберіть…</option>
                      {(productsQ.data ?? []).map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Магазин *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={cStoreId}
                      onChange={(e) => setCStoreId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      <option value="">Оберіть…</option>
                      {(storesQ.data ?? []).map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Дата створення *</Field.Label>
                  <Input
                    type="datetime-local"
                    value={cCreatedAt}
                    onChange={(e) => setCCreatedAt(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setCreateOpen(false)}>
                  Закрити
                </Button>
                <Button colorPalette="blue" loading={createMut.isPending} onClick={onCreate}>
                  Створити
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
