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
import { getCurrentUser } from "../../../api/authApi";
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  deleteOrder,
  deliverOrder,
  fetchOrders,
  updateOrder,
} from "../../../api/ordersApi";
import { fetchProducts } from "../../../api/productsApi";
import { fetchStores } from "../../../api/storesApi";
import { fetchUsers } from "../../../api/usersApi";
import type { CreateOrderPayload, Order, UpdateOrderPayload } from "../../../types";
import { OrderStatus } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../components/AdminTablePagination";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
  adminNativeSelectFieldProps,
  adminTableColumnHeaderProps,
  adminThemedInputProps,
  useAdminTheme,
  useAdminThemeTokens,
} from "../theme/AdminThemeContext";

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

export function AdminOrdersPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [storeFilter, setStoreFilter] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [cQuantity, setCQuantity] = useState("1");
  const [cProductId, setCProductId] = useState("");
  const [cStoreId, setCStoreId] = useState("");
  const [cCreatedAt, setCCreatedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [eQuantity, setEQuantity] = useState("");
  const [eProductId, setEProductId] = useState("");
  const [eStoreId, setEStoreId] = useState("");
  const [eCreatorId, setECreatorId] = useState("");
  const [eCreatedAt, setECreatedAt] = useState("");

  const meQ = useQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser, staleTime: 60_000 });
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const usersQ = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

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

  const openEdit = (o: Order) => {
    setEditOrder(o);
    setEQuantity(String(o.quantity));
    setEProductId(String(o.product.id));
    setEStoreId(String(o.store.id));
    setECreatorId(String(o.createdBy.id));
    setECreatedAt(o.createdAt.slice(0, 16));
    setFormError(null);
  };

  const createMut = useMutation({
    mutationFn: async () => {
      const me = meQ.data;
      if (!me) throw new Error("Немає даних користувача.");
      const q = Number(cQuantity);
      const pid = Number(cProductId);
      const sid = Number(cStoreId);
      if (!Number.isFinite(q) || q < 1 || !Number.isFinite(pid) || !Number.isFinite(sid)) {
        throw new Error("Перевірте кількість, товар і магазин.");
      }
      const createdAt = new Date(cCreatedAt).toISOString();
      const body: CreateOrderPayload = {
        status: OrderStatus.NEW,
        quantity: q,
        createdAt,
        productId: pid,
        storeId: sid,
        creatorId: me.id,
      };
      return createOrder(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setCreateOpen(false);
    },
    onError: (e) => {
      setFormError(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося створити замовлення."),
      );
    },
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!editOrder) return;
      const q = Number(eQuantity);
      const pid = Number(eProductId);
      const sid = Number(eStoreId);
      const cid = Number(eCreatorId);
      if (
        !Number.isFinite(q) ||
        !Number.isFinite(pid) ||
        !Number.isFinite(sid) ||
        !Number.isFinite(cid)
      ) {
        throw new Error("Перевірте поля форми.");
      }
      const body: UpdateOrderPayload = {
        id: editOrder.id,
        quantity: q,
        createdAt: new Date(eCreatedAt).toISOString(),
        productId: pid,
        storeId: sid,
        creatorId: cid,
      };
      return updateOrder(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setEditOrder(null);
    },
    onError: (e) => {
      setFormError(getApiErrorMessage(e, "Не вдалося оновити замовлення."));
    },
  });

  const confirmMut = useMutation({
    mutationFn: (id: number) => confirmOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
  const deliverMut = useMutation({
    mutationFn: (id: number) => deliverOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      await qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
  const delMut = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
      setDeleteId(null);
    },
  });

  const onActionErr = (e: unknown) =>
    setActionError(getApiErrorMessage(e, "Операція не виконана. Перевірте статус замовлення."));

  return (
    <Box>
      {actionError ? (
        <Text color="red.600" fontSize="sm" mb={3}>
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
        <Button colorPalette="blue" onClick={() => setCreateOpen(true)} ml={{ md: "auto" }}>
          Нове замовлення
        </Button>
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
                      <Flex gap={1} flexWrap="wrap" maxW="220px">
                        {o.status === OrderStatus.NEW ? (
                          <Button
                            {...actionBtnBase}
                            variant="solid"
                            bg="#DCFCE7"
                            color="#166534"
                            _hover={{ bg: "#BBF7D0" }}
                            loading={confirmMut.isPending}
                            onClick={() =>
                              confirmMut.mutate(o.id, {
                                onError: onActionErr,
                              })
                            }
                          >
                            Підтвердити
                          </Button>
                        ) : null}
                        {o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RECEIVED ? (
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
                        {o.status === OrderStatus.SHIPPED ? (
                          <Button
                            {...actionBtnBase}
                            variant="solid"
                            bg="#DBEAFE"
                            color="#1D4ED8"
                            _hover={{ bg: "#BFDBFE" }}
                            loading={deliverMut.isPending}
                            onClick={() =>
                              deliverMut.mutate(o.id, {
                                onError: onActionErr,
                              })
                            }
                          >
                            Отримано
                          </Button>
                        ) : null}
                        <Button
                          {...actionBtnBase}
                          variant="solid"
                          bg="#E2E8F0"
                          color="#334155"
                          _hover={{ bg: "#CBD5E1" }}
                          onClick={() => openEdit(o)}
                        >
                          Змінити
                        </Button>
                        <Button
                          {...actionBtnBase}
                          variant="solid"
                          bg="#FEE2E2"
                          color="#B91C1C"
                          _hover={{ bg: "#FECACA" }}
                          onClick={() => setDeleteId(o.id)}
                        >
                          Видалити
                        </Button>
                      </Flex>
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
                  <Text color="red.600" fontSize="sm" mb={2}>
                    {formError}
                  </Text>
                ) : null}
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
                <Button colorPalette="blue" loading={createMut.isPending} onClick={() => createMut.mutate()}>
                  Створити
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        open={editOrder != null}
        onOpenChange={(d) => {
          if (!d.open) setEditOrder(null);
          setFormError(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>Замовлення #{editOrder?.id}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.600" fontSize="sm" mb={2}>
                    {formError}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Кількість *</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={eQuantity}
                    onChange={(e) => setEQuantity(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Товар *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={eProductId}
                      onChange={(e) => setEProductId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
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
                      value={eStoreId}
                      onChange={(e) => setEStoreId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      {(storesQ.data ?? []).map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Автор (користувач) *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={eCreatorId}
                      onChange={(e) => setECreatorId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      {(usersQ.data ?? []).map((u) => (
                        <option key={u.id} value={String(u.id)}>
                          {u.username} ({String(u.role)})
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Дата створення *</Field.Label>
                  <Input
                    type="datetime-local"
                    value={eCreatedAt}
                    onChange={(e) => setECreatedAt(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setEditOrder(null)}>
                  Закрити
                </Button>
                <Button colorPalette="blue" loading={updateMut.isPending} onClick={() => updateMut.mutate()}>
                  Зберегти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Видалити замовлення?"
        body="Замовлення буде видалено безповоротно."
        confirmLabel="Видалити"
        loading={delMut.isPending}
        onConfirm={() => deleteId != null && delMut.mutate(deleteId)}
      />
    </Box>
  );
}
