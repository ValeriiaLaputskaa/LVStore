import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";
import { OrderStatus } from "../../../types";

const statusRows: {
  status: OrderStatus;
  label: string;
  dot: string;
  rowBg?: string;
}[] = [
  { status: OrderStatus.NEW, label: "Нове", dot: "#2274d4", rowBg: "#e8f0fc" },
  { status: OrderStatus.CONFIRMED, label: "Підтверджено", dot: "#f0991a" },
  { status: OrderStatus.SHIPPED, label: "Відправлено", dot: "#2274d4" },
  { status: OrderStatus.RECEIVED, label: "Отримано", dot: "#3b6d11" },
  { status: OrderStatus.CANCELLED, label: "Скасовано", dot: "#e24b4a" },
];

const tagStyles: Record<
  OrderStatus,
  { bg: string; border: string; color: string; label: string }
> = {
  [OrderStatus.NEW]: { bg: "#e8f0fc", border: "#b5d4f4", color: "#1658a8", label: "Нове" },
  [OrderStatus.CONFIRMED]: {
    bg: "#faeeda",
    border: "#fac775",
    color: "#854f0b",
    label: "Підтверджено",
  },
  [OrderStatus.SHIPPED]: {
    bg: "#e8f0fc",
    border: "#b5d4f4",
    color: "#1658a8",
    label: "Відправлено",
  },
  [OrderStatus.RECEIVED]: {
    bg: "#eaf3de",
    border: "#c0dd97",
    color: "#3b6d11",
    label: "Отримано",
  },
  [OrderStatus.CANCELLED]: {
    bg: "#fcebeb",
    border: "#f7c1c1",
    color: "#a32d2d",
    label: "Скасовано",
  },
};

export interface MainOrderStatusesSectionProps {
  orderStatusCounts: Record<OrderStatus, number>;
}

export function MainOrderStatusesSection({
  orderStatusCounts,
}: MainOrderStatusesSectionProps) {
  return (
    <Box bg="white" py="60px" px={{ base: 6, md: "150px" }}>
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
        gap={{ base: 10, lg: "72px" }}
        maxW="1140px"
        mx="auto"
        px={{ base: 0, md: "48px" }}
        alignItems="center"
      >
        <Box
          border="1px solid #dde6f0"
          rounded="18px"
          boxShadow="0px 4px 24px 0px rgba(34,116,212,0.06)"
          p="28px"
          pb="29px"
        >
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="#8a9ab0"
            letterSpacing="1px"
            textTransform="uppercase"
            lineHeight="19.2px"
            mb="20px"
          >
            Статуси замовлень
          </Text>
          <VStack gap={0} align="stretch" position="relative" pl="19px">
            {statusRows.map((s, i) => (
              <Box key={s.status} position="relative">
                {i < statusRows.length - 1 ? (
                  <Box
                    position="absolute"
                    left="-11px"
                    top="50px"
                    w="1.5px"
                    h="14px"
                    bg="#dde6f0"
                  />
                ) : null}
                <Flex align="center" gap="16px" px="14px" py="12px" rounded="10px" bg={s.rowBg}>
                  <Box bg={s.dot} rounded="6px" boxSize="12px" flexShrink={0} />
                  <Box flex="1" minW={0}>
                    <Text
                      fontWeight="medium"
                      fontSize="16px"
                      color="#0d1b2e"
                      lineHeight="25.6px"
                    >
                      {s.label}
                    </Text>
                  </Box>
                  <Box bg="#f4f7fb" rounded="20px" px="12px" py="1.5px">
                    <Text
                      fontWeight="semibold"
                      fontSize="14px"
                      color="#8a9ab0"
                      lineHeight="22.4px"
                    >
                      {orderStatusCounts[s.status]}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>

        <Flex direction="column" gap="8.9px">
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="#2274d4"
            letterSpacing="1.5px"
            textTransform="uppercase"
            lineHeight="19.2px"
          >
            Прозорість процесу
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "26px", md: "32px" }}
            color="#0d1b2e"
            letterSpacing="-0.5px"
            lineHeight={{ base: "32px", md: "36.8px" }}
          >
            Жодне замовлення не
            <br />
            загубиться
          </Text>
          <Text pt="5.11px" fontSize="16px" color="#5a6a80" lineHeight="28px">
            Кожне замовлення проходить чіткий шлях від моменту
            <br />
            оформлення до вручення покупцю. Ви й ваша команда бачать поточний статус у реальному часі —
            без дзвінків, без з&apos;ясувань, без нервів.
          </Text>

          <Box position="relative" h="102px" mt="8px" maxW="100%" overflow="hidden">
            <Box
              position="absolute"
              left={0}
              top="19.1px"
              bg={tagStyles[OrderStatus.NEW].bg}
              border="1px solid"
              borderColor={tagStyles[OrderStatus.NEW].border}
              rounded="20px"
              px="17px"
              py="7px"
            >
              <Text fontWeight="bold" fontSize="14px" color={tagStyles[OrderStatus.NEW].color}>
                {tagStyles[OrderStatus.NEW].label}
              </Text>
            </Box>
            <Box
              position="absolute"
              left="78.88px"
              top="19.1px"
              bg={tagStyles[OrderStatus.CONFIRMED].bg}
              border="1px solid"
              borderColor={tagStyles[OrderStatus.CONFIRMED].border}
              rounded="20px"
              px="17px"
              py="7px"
            >
              <Text
                fontWeight="bold"
                fontSize="14px"
                color={tagStyles[OrderStatus.CONFIRMED].color}
              >
                {tagStyles[OrderStatus.CONFIRMED].label}
              </Text>
            </Box>
            <Box
              position="absolute"
              left="220.41px"
              top="19.1px"
              bg={tagStyles[OrderStatus.SHIPPED].bg}
              border="1px solid"
              borderColor={tagStyles[OrderStatus.SHIPPED].border}
              rounded="20px"
              px="17px"
              py="7px"
            >
              <Text
                fontWeight="bold"
                fontSize="14px"
                color={tagStyles[OrderStatus.SHIPPED].color}
              >
                {tagStyles[OrderStatus.SHIPPED].label}
              </Text>
            </Box>
            <Box
              position="absolute"
              left="354.02px"
              top="19.1px"
              bg={tagStyles[OrderStatus.RECEIVED].bg}
              border="1px solid"
              borderColor={tagStyles[OrderStatus.RECEIVED].border}
              rounded="20px"
              px="17px"
              py="7px"
            >
              <Text
                fontWeight="bold"
                fontSize="14px"
                color={tagStyles[OrderStatus.RECEIVED].color}
              >
                {tagStyles[OrderStatus.RECEIVED].label}
              </Text>
            </Box>
            <Box
              position="absolute"
              left={0}
              top="65.49px"
              bg={tagStyles[OrderStatus.CANCELLED].bg}
              border="1px solid"
              borderColor={tagStyles[OrderStatus.CANCELLED].border}
              rounded="20px"
              px="17px"
              py="7px"
            >
              <Text
                fontWeight="bold"
                fontSize="14px"
                color={tagStyles[OrderStatus.CANCELLED].color}
              >
                {tagStyles[OrderStatus.CANCELLED].label}
              </Text>
            </Box>
          </Box>
        </Flex>
      </Grid>
    </Box>
  );
}
