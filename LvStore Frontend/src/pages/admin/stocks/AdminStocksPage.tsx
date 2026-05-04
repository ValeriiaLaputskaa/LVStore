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
import { fetchProducts } from "../../../api/productsApi";
import {
  createStock,
  deleteStock,
  fetchCriticalStocksByStore,
  fetchStocks,
  updateStock,
} from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
import type { CreateStockPayload, Stock, UpdateStockPayload } from "../../../types";
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

const tableActionBtnBase = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

export function AdminStocksPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [criticalStoreId, setCriticalStoreId] = useState<string>("");

  const criticalQ = useQuery({
    queryKey: ["stocks", "critical", criticalStoreId],
    queryFn: () => fetchCriticalStocksByStore(Number(criticalStoreId)),
    enabled: criticalStoreId !== "",
  });

  const filtered = useMemo(() => {
    let rows = stocksQ.data ?? [];
    if (storeFilter) {
      const sid = Number(storeFilter);
      rows = rows.filter((s) => s.store?.id === sid);
    }
    if (productFilter) {
      const pid = Number(productFilter);
      rows = rows.filter((s) => s.product?.id === pid);
    }
    return rows;
  }, [stocksQ.data, storeFilter, productFilter]);

  const totalFiltered = filtered.length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [storeFilter, productFilter]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [filtered, page]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [stProductId, setStProductId] = useState("");
  const [stStoreId, setStStoreId] = useState("");
  const [stQty, setStQty] = useState("");
  const [stMin, setStMin] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setStProductId("");
    setStStoreId("");
    setStQty("");
    setStMin("");
    setFormErr(null);
    setDialogOpen(true);
  };

  const openEdit = (s: Stock) => {
    setEditing(s);
    setStProductId(String(s.product.id));
    setStStoreId(String(s.store.id));
    setStQty(String(s.quantity));
    setStMin(String(s.minQuantity));
    setFormErr(null);
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const pid = Number(stProductId);
      const sid = Number(stStoreId);
      const q = Number(stQty);
      const m = Number(stMin);
      if (!Number.isFinite(pid) || !Number.isFinite(sid) || !Number.isFinite(q) || !Number.isFinite(m)) {
        throw new Error("Перевірте числові поля.");
      }
      if (editing) {
        const body: UpdateStockPayload = {
          id: editing.id,
          productId: pid,
          storeId: sid,
          quantity: q,
          minQuantity: m,
        };
        return updateStock(body);
      }
      const body: CreateStockPayload = {
        productId: pid,
        storeId: sid,
        quantity: q,
        minQuantity: m,
      };
      return createStock(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      await qc.invalidateQueries({ queryKey: ["orders"] });
      setDialogOpen(false);
    },
    onError: (e) => {
      setFormErr(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти залишок."),
      );
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteStock(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setDeleteId(null);
    },
  });

  const isCriticalRow = (s: Stock) => s.quantity <= s.minQuantity;

  return (
    <Box>
      <Flex direction={{ base: "column", lg: "row" }} gap={4} mb={4}>
        <Field.Root maxW={{ lg: "200px" }}>
          <Field.Label fontSize="xs" color={t.headingText}>
            Магазин
          </Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
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
        <Field.Root maxW={{ lg: "220px" }}>
          <Field.Label fontSize="xs" color={t.headingText}>
            Товар
          </Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              {...adminNativeSelectFieldProps(t, isDark)}
            >
              <option value="">Усі</option>
              {(productsQ.data ?? []).map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
        <Button colorPalette="blue" ml={{ lg: "auto" }} alignSelf={{ base: "stretch", lg: "center" }} onClick={openCreate}>
          Додати залишок
        </Button>
      </Flex>

      <Box
        mb={6}
        p={4}
        bg={t.secondaryPanelBg}
        rounded="md"
        borderWidth="1px"
        borderColor={t.secondaryPanelBorder}
      >
        <Text fontWeight="semibold" mb={2} fontSize="sm" color={t.headingText}>
          Критичні залишки за магазином
        </Text>
        <Flex gap={3} align="flex-end" flexWrap="wrap">
          <Field.Root maxW="240px">
            <Field.Label fontSize="xs" color={t.headingText}>
              Магазин
            </Field.Label>
            <NativeSelectRoot>
              <NativeSelectField
                value={criticalStoreId}
                onChange={(e) => setCriticalStoreId(e.target.value)}
                {...adminNativeSelectFieldProps(t, isDark)}
              >
                <option value="">Оберіть магазин…</option>
                {(storesQ.data ?? []).map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field.Root>
          {criticalStoreId && criticalQ.isPending ? <Skeleton height="24px" width="120px" /> : null}
          {criticalStoreId && criticalQ.isSuccess ? (
            <Badge colorPalette="orange" size="lg">
              Записів: {criticalQ.data.length}
            </Badge>
          ) : null}
        </Flex>
        {criticalStoreId && criticalQ.isSuccess && criticalQ.data.length > 0 ? (
          <Box mt={3} maxH="160px" overflowY="auto" fontSize="sm" color={t.secondaryPanelText}>
            {criticalQ.data.map((s) => (
              <Text key={s.id}>
                {s.product?.name ?? "—"} — {s.quantity} / мін. {s.minQuantity}
              </Text>
            ))}
          </Box>
        ) : null}
      </Box>

      {stocksQ.isError ? <Text color="red.600">Не вдалося завантажити залишки.</Text> : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Товар</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Магазин</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end" {...adminTableColumnHeaderProps(t)}>
                  Кількість
                </Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end" {...adminTableColumnHeaderProps(t)}>
                  Мін.
                </Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Статус</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {stocksQ.isPending
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="18px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!stocksQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає записів залишків.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!stocksQ.isPending &&
                pagedRows.map((s) => (
                  <Table.Row key={s.id}>
                    <Table.Cell>{s.id}</Table.Cell>
                    <Table.Cell>{s.product?.name ?? "—"}</Table.Cell>
                    <Table.Cell>{s.store?.name ?? "—"}</Table.Cell>
                    <Table.Cell textAlign="end">{s.quantity}</Table.Cell>
                    <Table.Cell textAlign="end">{s.minQuantity}</Table.Cell>
                    <Table.Cell>
                      {isCriticalRow(s) ? (
                        <Badge colorPalette="orange" size="sm">
                          Критично
                        </Badge>
                      ) : (
                    <Text fontSize="sm" color={t.mutedText}>
                      OK
                    </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap={2} flexWrap="wrap">
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#E2E8F0"
                          color="#334155"
                          _hover={{ bg: "#CBD5E1" }}
                          onClick={() => openEdit(s)}
                        >
                          Змінити
                        </Button>
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#FEE2E2"
                          color="#B91C1C"
                          _hover={{ bg: "#FECACA" }}
                          onClick={() => setDeleteId(s.id)}
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
        {!stocksQ.isPending && totalFiltered > 0 ? (
          <AdminTablePagination
            page={page}
            pageSize={ADMIN_TABLE_PAGE_SIZE}
            total={totalFiltered}
            onPageChange={setPage}
            itemsLabel="записів залишків"
          />
        ) : null}
      </Box>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(d) => {
          setDialogOpen(d.open);
          if (!d.open) setFormErr(null);
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Залишок" : "Новий залишок"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formErr ? (
                  <Text color="red.600" fontSize="sm" mb={2}>
                    {formErr}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Товар *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={stProductId}
                      onChange={(e) => setStProductId(e.target.value)}
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
                      value={stStoreId}
                      onChange={(e) => setStStoreId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      <option value="">Оберіть…</option>
                      {(storesQ.data ?? []).map((st) => (
                        <option key={st.id} value={String(st.id)}>
                          {st.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Кількість *</Field.Label>
                  <Input
                    type="number"
                    min={0}
                    value={stQty}
                    onChange={(e) => setStQty(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Мінімальна кількість *</Field.Label>
                  <Input
                    type="number"
                    min={0}
                    value={stMin}
                    onChange={(e) => setStMin(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button colorPalette="blue" loading={saveMut.isPending} onClick={() => saveMut.mutate()}>
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
        title="Видалити запис залишку?"
        body="Цю дію неможливо скасувати."
        confirmLabel="Видалити"
        loading={delMut.isPending}
        onConfirm={() => deleteId != null && delMut.mutate(deleteId)}
      />
    </Box>
  );
}
