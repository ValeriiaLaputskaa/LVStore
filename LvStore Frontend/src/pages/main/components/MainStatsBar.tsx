import { Box, Flex, Grid, Text } from "@chakra-ui/react";

export function MainStatsBar() {
  return (
    <Box bg="#2274d4" py="40px" px={{ base: 6, md: "150px" }}>
      <Grid
        templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
        maxW="1140px"
        mx="auto"
        gap={{ base: 6, md: 0 }}
      >
        <Flex
          direction="column"
          gap="6px"
          align="center"
          borderRight={{ md: "1px solid rgba(255,255,255,0.2)" }}
          px={{ md: "24px" }}
        >
          <Text
            fontFamily="'Public Sans', sans-serif"
            fontWeight="bold"
            fontSize="40px"
            color="white"
            letterSpacing="-1px"
            lineHeight="40px"
            textAlign="center"
          >
            500+
          </Text>
          <Text
            fontSize="14px"
            color="rgba(255,255,255,0.75)"
            lineHeight="22.4px"
            textAlign="center"
          >
            Магазинів у системі
          </Text>
        </Flex>
        <Flex
          direction="column"
          gap="6px"
          align="center"
          borderRight={{ md: "1px solid rgba(255,255,255,0.2)" }}
          px={{ md: "24px" }}
        >
          <Text
            fontFamily="'Public Sans', sans-serif"
            fontWeight="bold"
            fontSize="40px"
            color="white"
            letterSpacing="-1px"
            lineHeight="40px"
            textAlign="center"
          >
            142K
          </Text>
          <Text
            fontSize="14px"
            color="rgba(255,255,255,0.75)"
            lineHeight="22.4px"
            textAlign="center"
          >
            Товарів у каталогах
          </Text>
        </Flex>
        <Flex
          direction="column"
          gap="6px"
          align="center"
          borderRight={{ md: "1px solid rgba(255,255,255,0.2)" }}
          px={{ md: "24px" }}
        >
          <Text
            fontFamily="'Public Sans', sans-serif"
            fontWeight="bold"
            fontSize="40px"
            color="white"
            letterSpacing="-1px"
            lineHeight="40px"
            textAlign="center"
          >
            99.9%
          </Text>
          <Text
            fontSize="14px"
            color="rgba(255,255,255,0.75)"
            lineHeight="22.4px"
            textAlign="center"
          >
            Uptime платформи
          </Text>
        </Flex>
        <Flex direction="column" gap="6px" align="center" px={{ md: "24px" }}>
          <Text
            fontFamily="'Public Sans', sans-serif"
            fontWeight="bold"
            fontSize="40px"
            color="white"
            letterSpacing="-1px"
            lineHeight="40px"
            textAlign="center"
          >
            3 ролі
          </Text>
          <Text
            fontSize="14px"
            color="rgba(255,255,255,0.75)"
            lineHeight="22.4px"
            textAlign="center"
          >
            Рівні доступу
          </Text>
        </Flex>
      </Grid>
    </Box>
  );
}
