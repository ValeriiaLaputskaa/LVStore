import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  Portal,
  Skeleton,
  Table,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import type { CreateProductPayload, Product, UpdateProductPayload } from "../../../types";
import {
  PRODUCT_SEARCH_INPUT_PLACEHOLDER,
  useProductSearchTypewriter,
} from "../../../hooks/useProductSearchTypewriter";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../../api/productsApi";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../components/AdminTablePagination";
import {
  adminDialogContentProps,
  adminDialogOutlineButtonProps,
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

function formatPrice(p: number): string {
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2 }).format(p);
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [description, setDescription] = useState("");

  const listQ = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const filtered = useMemo(() => {
    const rows = listQ.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [listQ.data, search]);

  const totalFiltered = filtered.length;
  const totalPages =
    totalFiltered === 0 ? 0 : Math.ceil(totalFiltered / ADMIN_TABLE_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * ADMIN_TABLE_PAGE_SIZE;
    return filtered.slice(start, start + ADMIN_TABLE_PAGE_SIZE);
  }, [filtered, page]);

  const typewriterActive = !searchFocused && search === "";
  const typewriterDisplay = useProductSearchTypewriter(typewriterActive);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setCategory("");
    setBarcode("");
    setPriceStr("");
    setDescription("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setCategory(p.category);
    setBarcode(p.barcode);
    setPriceStr(String(p.price));
    setDescription(p.description ?? "");
    setFormError(null);
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const price = Number(priceStr.replace(",", "."));
      if (!name.trim() || !category.trim() || !barcode.trim() || Number.isNaN(price)) {
        throw new Error("Заповніть обов’язкові поля коректно.");
      }
      if (editing) {
        const body: UpdateProductPayload = {
          id: editing.id,
          name: name.trim(),
          category: category.trim(),
          barcode: barcode.trim(),
          price,
          description: description.trim() || undefined,
        };
        return updateProduct(body);
      }
      const body: CreateProductPayload = {
        name: name.trim(),
        category: category.trim(),
        barcode: barcode.trim(),
        price,
        description: description.trim() || undefined,
      };
      return createProduct(body);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
    },
    onError: (e) => {
      setFormError(
        e instanceof Error && !isAxiosError(e)
          ? e.message
          : getApiErrorMessage(e, "Не вдалося зберегти товар."),
      );
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
  });

  return (
    <Box>
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={3}
        mb={4}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
      >
        <Box position="relative" maxW={{ md: "360px" }} w="full">
          <Input
            role="search"
            aria-label={PRODUCT_SEARCH_INPUT_PLACEHOLDER}
            placeholder={typewriterActive ? "" : PRODUCT_SEARCH_INPUT_PLACEHOLDER}
            maxW="100%"
            bg={t.inputBg}
            color={t.headingText}
            position="relative"
            zIndex={1}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            _placeholder={{ color: t.mutedText }}
          />
          {typewriterActive ? (
            <Text
              position="absolute"
              left={3}
              right={3}
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
              pointerEvents="none"
              color={t.mutedText}
              fontSize="sm"
              lineHeight="normal"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {typewriterDisplay}
            </Text>
          ) : null}
        </Box>
        <Button colorPalette="blue" onClick={openCreate} alignSelf={{ base: "stretch", sm: "center" }}>
          Додати товар
        </Button>
      </Flex>

      {listQ.isError ? (
        <Text color="red.600">Не вдалося завантажити товари.</Text>
      ) : null}

      <Box bg={t.surface} rounded="md" borderWidth="1px" borderColor={t.surfaceBorder} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg={t.tableHeaderBg} color={t.headingText}>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>ID</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Назва</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Категорія</Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Штрихкод</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end" {...adminTableColumnHeaderProps(t)}>
                  Ціна
                </Table.ColumnHeader>
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Дії</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={t.surface} color={t.headingText}>
              {listQ.isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <Table.Cell key={j}>
                          <Skeleton height="20px" />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : null}
              {!listQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={6}>
                    <Text color={t.mutedText} py={4} textAlign="center">
                      Немає товарів для відображення.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ) : null}
              {!listQ.isPending &&
                pagedRows.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>{p.id}</Table.Cell>
                    <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                    <Table.Cell>{p.category}</Table.Cell>
                    <Table.Cell>{p.barcode}</Table.Cell>
                    <Table.Cell textAlign="end">{formatPrice(p.price)}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2} flexWrap="wrap">
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#E2E8F0"
                          color="#334155"
                          _hover={{ bg: "#CBD5E1" }}
                          onClick={() => openEdit(p)}
                        >
                          Змінити
                        </Button>
                        <Button
                          {...tableActionBtnBase}
                          variant="solid"
                          bg="#FEE2E2"
                          color="#B91C1C"
                          _hover={{ bg: "#FECACA" }}
                          onClick={() => setDeleteId(p.id)}
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
            itemsLabel="товарів"
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
            <Dialog.Content
              maxW="lg"
              mx={4}
              maxH="90vh"
              overflowY="auto"
              {...adminDialogContentProps(t)}
            >
              <Dialog.Header>
                <Dialog.Title>{editing ? "Редагування товару" : "Новий товар"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {formError ? (
                  <Text color="red.600" fontSize="sm" mb={3}>
                    {formError}
                  </Text>
                ) : null}
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Назва *</Field.Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} {...adminThemedInputProps(t)} />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Категорія *</Field.Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Штрихкод *</Field.Label>
                  <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} {...adminThemedInputProps(t)} />
                </Field.Root>
                <Field.Root mb={3}>
                  <Field.Label color={t.mutedText}>Ціна *</Field.Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={priceStr}
                    onChange={(e) => setPriceStr(e.target.value)}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label color={t.mutedText}>Опис</Field.Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    {...adminThemedInputProps(t)}
                  />
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer gap={2}>
                <Button {...adminDialogOutlineButtonProps(t, isDark)} onClick={() => setDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button
                  colorPalette="blue"
                  loading={saveMut.isPending}
                  onClick={() => saveMut.mutate()}
                >
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
        title="Видалити товар?"
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
