import {
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
  createWarehouseStock,
  deleteWarehouseStock,
  fetchWarehouseStocks,
  updateWarehouseStock,
} from "../../../api/warehouseStocksApi";
import { fetchWarehouses } from "../../../api/warehousesApi";
import type { WarehouseStock } from "../../../types";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConfirmDialog } from "../../admin/components/ConfirmDialog";
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

const tableActionBtnBase = {
  size: "sm" as const,
  h: "32px",
  px: "12px",
  rounded: "md",
  fontSize: "12px",
  fontWeight: "semibold",
};

export function WarehouseWarehouseStocksPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();

  const listQ = useQuery({ queryKey: ["warehouse-stocks"], queryFn: fetchWarehouseStocks });
  const warehousesQ = useQuery({ queryKey: ["warehouses"], queryFn: fetchWarehouses });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseStock | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [wId, setWId] = useState("");
  const [pId, setPId] = useState("");
  const [qtyStr, setQtyStr] = useState("");

  const filtered = useMemo(() => {
    let rows = listQ.data ?? [];
    if (warehouseFilter) rows = rows.filter((r) => String(r.warehouse?.id ?? "") === warehouseFilter);
    if (productFilter) rows = rows.filter((r) => String(r.product?.id ?? "") === productFilter);
    return rows;
  }, [listQ.data, warehouseFilter, productFilter]);

  const totalFiltered = filtered.length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when filters change
    setPage(1);
  }, [warehouseFilter, productFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page to new total
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [filtered, page]);

  const openCreate = () => {
    setEditing(null);
    setWId("");
    setPId("");
    setQtyStr("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: WarehouseStock) => {
    setEditing(row);
    setWId(String(row.warehouse?.id ?? ""));
    setPId(String(row.product?.id ?? ""));
    setQtyStr(String(row.quantity));
    setFormError(null);
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const warehouseId = Number(wId);
      const productId = Number(pId);
      const quantity = Number(qtyStr);
      if (!wId || !pId || Number.isNaN(warehouseId) || Number.isNaN(productId) || Number.isNaN(quantity)) {
        throw new Error("Оберіть склад і товар, вкажіть коректну кількість.");
      }
      if (editing) {
        return updateWarehouseStock({
          id: editing.id,
          warehouseId,
          productId,
          quantity,
        });
      }
      return createWarehouseStock({ warehouseId, productId, quantity });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["warehouse-stocks"] });
      setDialogOpen(false);
    },
    onError: (e) => {
      setFormError(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти запис."),
      );
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteWarehouseStock(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["warehouse-stocks"] });
      setDeleteId(null);
    },
  });

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={4}
        align={{ base: "stretch", md: "flex-end" }}
        justify="space-between"
        flexWrap="wrap"
      >
        <Flex gap={3} flexWrap="wrap" flex="1">
          <Field.Root maxW={{ md: "220px" }}>
            <Field.Label fontSize="xs" color={t.headingText}>
              Склад
            </Field.Label>
            <NativeSelectRoot>
              <NativeSelectField
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                {...adminNativeSelectFieldProps(t, isDark)}
              >
                <option value="">Усі</option>
                {(warehousesQ.data ?? []).map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field.Root>
          <Field.Root maxW={{ md: "260px" }}>
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
        <Button colorPalette="blue" onClick={openCreate} alignSelf={{ base: "stretch", md: "center" }}>
          Додати залишок
        </Button>
      </Flex>

      {listQ.isError ? (
        <Text color="red.600" mb={3}>
          Не вдалося завантажити складські залишки.
        </Text>
      ) : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Склад</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Товар</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Кількість</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {listQ.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="20px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!listQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає записів. Додайте залишок або змініть фільтри.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!listQ.isPending &&
                pagedRows.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>{row.id}</Table.Cell>
                    <Table.Cell>{row.warehouse?.name ?? "—"}</Table.Cell>
                    <Table.Cell>{row.product?.name ?? "—"}</Table.Cell>
                    <Table.Cell>{row.quantity}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2} flexWrap="wrap">
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#E2E8F0"
                          color="#334155"
                          _hover={{ bg: "#CBD5E1" }}
                          onClick={() => openEdit(row)}
                        >
                          Змінити
                        </Button>
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#FEE2E2"
                          color="#B91C1C"
                          _hover={{ bg: "#FECACA" }}
                          onClick={() => setDeleteId(row.id)}
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
        {!listQ.isPending && totalFiltered > 0 ? (
          <AdminTablePagination
            page={page}
            pageSize={ADMIN_TABLE_PAGE_SIZE}
            total={totalFiltered}
            onPageChange={setPage}
            itemsLabel="записів"
          />
        ) : null}
      </Box>

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(d) => {
          setDialogOpen(d.open);
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
                <Dialog.Title>
                  {editing ? "Редагування складського залишку" : "Новий складський залишок"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.600" fontSize="sm" mb={3}>
                    {formError}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Склад *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={wId}
                      onChange={(e) => setWId(e.target.value)}
                      {...adminNativeSelectFieldProps(t, isDark)}
                    >
                      <option value="">Оберіть…</option>
                      {(warehousesQ.data ?? []).map((w) => (
                        <option key={w.id} value={String(w.id)}>
                          {w.name}
                        </option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Товар *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={pId}
                      onChange={(e) => setPId(e.target.value)}
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
                <Field.Root>
                  <Field.Label color={t.mutedText}>Кількість *</Field.Label>
                  <Input
                    type="number"
                    min={0}
                    value={qtyStr}
                    onChange={(e) => setQtyStr(e.target.value)}
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
        title="Видалити запис?"
        body="Цю дію неможливо скасувати."
        confirmLabel="Видалити"
        loading={delMut.isPending}
        onConfirm={() => {
          if (deleteId != null) delMut.mutate(deleteId);
        }}
      />
    </Box>
  );
}
