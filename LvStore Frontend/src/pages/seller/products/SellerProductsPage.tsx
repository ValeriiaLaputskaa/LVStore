import { Box, Button, Flex, Input, Skeleton, Table, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../../api/productsApi";
import {
  PRODUCT_SEARCH_INPUT_PLACEHOLDER,
  useProductSearchTypewriter,
} from "../../../hooks/useProductSearchTypewriter";
import type { Product } from "../../../types";
import {
  ADMIN_TABLE_PAGE_SIZE,
  AdminTablePagination,
} from "../../admin/components/AdminTablePagination";
import { adminTableColumnHeaderProps, useAdminThemeTokens } from "../../admin/theme/AdminThemeContext";

function formatPrice(p: number): string {
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 2 }).format(p);
}

export function SellerProductsPage() {
  const t = useAdminThemeTokens();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [page, setPage] = useState(1);

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

  const goOrderWithProduct = (p: Product) => {
    navigate("/seller/orders", { state: { productId: p.id } });
  };

  return (
    <Box>
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={3}
        mb={4}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
      >
        <Box position="relative" maxW={{ md: "400px" }} w="full">
          <Input
            role="search"
            aria-label={PRODUCT_SEARCH_INPUT_PLACEHOLDER}
            placeholder={typewriterActive ? "" : PRODUCT_SEARCH_INPUT_PLACEHOLDER}
            maxW="100%"
            bg={t.inputBg}
            color={t.headingText}
            borderWidth="1px"
            borderColor={t.surfaceBorder}
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
      </Flex>

      {listQ.isError ? (
        <Text color="red.500">Не вдалося завантажити товари.</Text>
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
                <Table.ColumnHeader {...adminTableColumnHeaderProps(t)}>Опис</Table.ColumnHeader>
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
              {!listQ.isPending && filtered.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7}>
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
                    <Table.Cell maxW="220px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      {p.description?.trim() ? p.description : "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="sm"
                        colorPalette="blue"
                        onClick={() => goOrderWithProduct(p)}
                      >
                        Замовити
                      </Button>
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
    </Box>
  );
}
