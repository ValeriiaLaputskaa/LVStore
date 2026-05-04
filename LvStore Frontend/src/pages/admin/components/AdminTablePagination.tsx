import { Box, chakra, Flex, Text } from "@chakra-ui/react";
import { useAdminThemeTokens } from "../theme/AdminThemeContext";

/** Розмір сторінки як у макеті LV-Store (Figma node 69:4260). */
export const ADMIN_TABLE_PAGE_SIZE = 8;

const ACTIVE_BG = "#2274d4";
const ACTIVE_BORDER = "#1f3864";

function Chevron({ direction, color }: { direction: "prev" | "next"; color: string }) {
  const rotate = direction === "prev" ? "rotate(180deg)" : undefined;
  return (
    <Box
      as="span"
      display="inline-flex"
      w="14px"
      h="14px"
      alignItems="center"
      justifyContent="center"
      color={color}
      transform={rotate}
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

function visiblePageNumbers(current: number, totalPages: number): number[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 2) return [1, 2, 3];
  if (current >= totalPages - 1) {
    return [totalPages - 2, totalPages - 1, totalPages].filter((p) => p >= 1);
  }
  return [current - 1, current, current + 1];
}

type AdminTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Генітив множини: «товарів», «замовлень», «записів залишків», «магазинів», «користувачів». */
  itemsLabel: string;
};

export function AdminTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemsLabel,
}: AdminTablePaginationProps) {
  const t = useAdminThemeTokens();

  if (total <= 0) return null;

  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  const showingCount = to - from + 1;

  const pages = visiblePageNumbers(safePage, totalPages);
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const pageBtnBase = {
    w: "36px",
    h: "36px",
    minW: "36px",
    p: 0,
    rounded: "5px",
    fontSize: "14px",
    fontWeight: "normal" as const,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    cursor: "pointer" as const,
    transition: "background 0.15s, border-color 0.15s",
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      flexWrap="wrap"
      gap={3}
      bg={t.paginationBarBg}
      borderTopWidth="1px"
      borderTopColor={t.paginationBarBorder}
      pt="17px"
      pb="12px"
      pl="16px"
      pr={{ base: "16px", md: "77px" }}
    >
      <Text fontSize="14px" color={t.paginationLabel} whiteSpace="nowrap">
        Показано {showingCount} з {total} {itemsLabel}
      </Text>
      <Flex gap="8px" align="center" flexShrink={0}>
        {canPrev ? (
          <chakra.button
            type="button"
            aria-label="Попередня сторінка"
            {...pageBtnBase}
            bg={t.paginationInactiveBg}
            borderWidth="1px"
            borderColor={t.paginationInactiveBorder}
            _hover={{ bg: t.paginationHoverBg }}
            onClick={() => onPageChange(safePage - 1)}
          >
            <Chevron direction="prev" color={t.paginationInactiveText} />
          </chakra.button>
        ) : null}
        {pages.map((p) => {
          const isActive = p === safePage;
          return (
            <chakra.button
              key={p}
              type="button"
              aria-label={`Сторінка ${p}`}
              aria-current={isActive ? "page" : undefined}
              {...pageBtnBase}
              bg={isActive ? ACTIVE_BG : t.paginationInactiveBg}
              borderWidth="1px"
              borderColor={isActive ? ACTIVE_BORDER : t.paginationInactiveBorder}
              color={isActive ? "white" : t.paginationInactiveText}
              _hover={
                isActive
                  ? { bg: ACTIVE_BG }
                  : { bg: t.paginationHoverBg }
              }
              onClick={() => onPageChange(p)}
            >
              {p}
            </chakra.button>
          );
        })}
        {canNext ? (
          <chakra.button
            type="button"
            aria-label="Наступна сторінка"
            {...pageBtnBase}
            bg={t.paginationInactiveBg}
            borderWidth="1px"
            borderColor={t.paginationInactiveBorder}
            _hover={{ bg: t.paginationHoverBg }}
            onClick={() => onPageChange(safePage + 1)}
          >
            <Chevron direction="next" color={t.paginationInactiveText} />
          </chakra.button>
        ) : null}
      </Flex>
    </Flex>
  );
}
