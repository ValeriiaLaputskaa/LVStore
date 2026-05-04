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
import { fetchCriticalStocksByStore, fetchStocks, updateStock } from "../../../api/stocksApi";
import { fetchStores } from "../../../api/storesApi";
import { fetchProducts } from "../../../api/productsApi";
import type { Stock, UpdateStockPayload } from "../../../types";
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

const btnSm = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

function isCritical(s: Stock): boolean {
  return s.quantity <= s.minQuantity;
}

export function SellerStocksPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);
  const [criticalStoreId, setCriticalStoreId] = useState("");

  const stocksQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const storesQ = useQuery({ queryKey: ["stores"], queryFn: fetchStores });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const criticalQ = useQuery({
    queryKey: ["stocks", "critical", criticalStoreId],
    queryFn: () => fetchCriticalStocksByStore(Number(criticalStoreId)),
    enabled: criticalStoreId !== "",
  });

  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [qtyStr, setQtyStr] = useState("");
  const [minStr, setMinStr] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);

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

  const openEdit = (s: Stock) => {
    setEditStock(s);
    setQtyStr(String(s.quantity));
    setMinStr(String(s.minQuantity));
    setFormErr(null);
  };

  const saveMut = useMutation({
    mutationFn: (body: UpdateStockPayload) => updateStock(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      await qc.invalidateQueries({ queryKey: ["orders"] });
      setEditStock(null);
    },
    onError: (e) => {
      setFormErr(
        isAxiosError(e) && e.response?.status === 403
          ? "У вас немає доступу до цієї дії."
          : getApiErrorMessage(e, "Не вдалося оновити залишок."),
      );
    },
  });

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

      {stocksQ.isError ? <Text color="red.500">Не вдалося завантажити залишки.</Text> : null}

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
                      {isCritical(s) ? (
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
                      <Button {...btnSm} colorPalette="blue" variant="solid" onClick={() => openEdit(s)}>
                        Оновити
                      </Button>
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
        open={editStock != null}
        onOpenChange={(d) => {
          if (!d.open) {
            setEditStock(null);
            setFormErr(null);
          }
        }}
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content maxW="md" mx={4} {...adminDialogContentProps(t)}>
              <Dialog.Header>
                <Dialog.Title>Оновити залишок</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formErr ? (
                  <Text color="red.500" fontSize="sm" mb={2}>
                    {formErr}
                  </Text>
                ) : null}
                {editStock ? (
                  <Text fontSize="sm" color={t.mutedText} mb={3}>
                    {editStock.product?.name ?? "—"} · {editStock.store?.name ?? "—"}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Кількість *</Field.Label>
                  <Input
                    type="number"
                    min={0}
                    value={qtyStr}
                    onChange={(e) => setQtyStr(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Мінімальна кількість *</Field.Label>
                  <Input
                    type="number"
                    min={0}
                    value={minStr}
                    onChange={(e) => setMinStr(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setEditStock(null)}>
                  Скасувати
                </Button>
                <Button
                  colorPalette="blue"
                  loading={saveMut.isPending}
                  onClick={() => {
                    if (!editStock) return;
                    const q = Number(qtyStr);
                    const m = Number(minStr);
                    if (!Number.isFinite(q) || !Number.isFinite(m)) {
                      setFormErr("Введіть коректні числа.");
                      return;
                    }
                    setFormErr(null);
                    saveMut.mutate({
                      id: editStock.id,
                      productId: editStock.product.id,
                      storeId: editStock.store.id,
                      quantity: q,
                      minQuantity: m,
                    });
                  }}
                >
                  Зберегти
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
