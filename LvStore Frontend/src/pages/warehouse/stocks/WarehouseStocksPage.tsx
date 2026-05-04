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
import { createStock, deleteStock, fetchStocks, updateStock } from "../../../api/stocksApi";
import type { Stock } from "../../../types";
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

function isCritical(s: Stock): boolean {
  return s.quantity <= s.minQuantity;
}

export function WarehouseStocksPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();

  const listQ = useQuery({ queryKey: ["stocks"], queryFn: fetchStocks });
  const productsQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [productId, setProductId] = useState("");
  const [storeIdStr, setStoreIdStr] = useState("");
  const [qtyStr, setQtyStr] = useState("");
  const [minQtyStr, setMinQtyStr] = useState("");

  const totalFiltered = (listQ.data ?? []).length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page to new total
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const rows = listQ.data ?? [];
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return rows.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [listQ.data, page]);

  const openCreate = () => {
    setEditing(null);
    setProductId("");
    setStoreIdStr("");
    setQtyStr("");
    setMinQtyStr("0");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (s: Stock) => {
    setEditing(s);
    setProductId(String(s.product?.id ?? ""));
    setStoreIdStr(String(s.store?.id ?? ""));
    setQtyStr(String(s.quantity));
    setMinQtyStr(String(s.minQuantity));
    setFormError(null);
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const storeId = Number(storeIdStr);
      const pid = Number(productId);
      const quantity = Number(qtyStr);
      const minQuantity = Number(minQtyStr);
      if (!productId || Number.isNaN(pid) || Number.isNaN(storeId) || storeId < 1) {
        throw new Error("Оберіть товар і вкажіть коректний ID магазину.");
      }
      if (Number.isNaN(quantity) || Number.isNaN(minQuantity)) {
        throw new Error("Вкажіть коректні кількості.");
      }
      if (editing) {
        return updateStock({
          id: editing.id,
          productId: pid,
          storeId,
          quantity,
          minQuantity,
        });
      }
      return createStock({ productId: pid, storeId, quantity, minQuantity });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["stocks"] });
      setDialogOpen(false);
    },
    onError: (e) => {
      setFormError(
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

  return (
    <Box>
      <Text fontSize="sm" color={t.mutedText} mb={3}>
        Залишки в магазинах. ID магазину вводьте вручну або копіюйте з існуючого запису — списку
        магазинів у цій зоні немає.
      </Text>
      <Flex justify="flex-end" mb={4}>
        <Button colorPalette="blue" onClick={openCreate}>
          Додати залишок
        </Button>
      </Flex>

      {listQ.isError ? <Text color="red.600">Не вдалося завантажити залишки.</Text> : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Товар</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Магазин</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Кількість</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Мін.</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Статус</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {listQ.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="20px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!listQ.isPending && totalFiltered === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає записів залишків.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!listQ.isPending &&
                pagedRows.map((s) => (
                  <Table.Row key={s.id}>
                    <Table.Cell>{s.id}</Table.Cell>
                    <Table.Cell>{s.product?.name ?? "—"}</Table.Cell>
                    <Table.Cell>
                      {s.store?.name ?? "—"}{" "}
                      <Text as="span" fontSize="xs" color={t.mutedText}>
                        (#{s.store?.id ?? "—"})
                      </Text>
                    </Table.Cell>
                    <Table.Cell>{s.quantity}</Table.Cell>
                    <Table.Cell>{s.minQuantity}</Table.Cell>
                    <Table.Cell>
                      {isCritical(s) ? (
                        <Badge colorPalette="red" variant="solid">
                          Критично
                        </Badge>
                      ) : (
                        <Text fontSize="sm" color={t.mutedText}>
                          Ок
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
                <Dialog.Title>{editing ? "Редагування залишку" : "Новий залишок у магазині"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.600" fontSize="sm" mb={3}>
                    {formError}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Товар *</Field.Label>
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
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
                  <Field.Label color={t.mutedText}>ID магазину *</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    value={storeIdStr}
                    onChange={(e) => setStoreIdStr(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
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
                    value={minQtyStr}
                    onChange={(e) => setMinQtyStr(e.target.value)}
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
        title="Видалити залишок?"
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
