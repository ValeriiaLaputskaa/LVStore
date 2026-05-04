import { Box, Flex, Text } from "@chakra-ui/react";

export function MainCtaSection() {
  return (
    <Box bg="#f5f8fd" py="60px" px={{ base: 6, md: "360px" }}>
      <Box maxW="720px" mx="auto" px={{ base: 0, md: "48px" }}>
        <Flex direction="column" gap="10px" align="center">
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="#2274d4"
            letterSpacing="1.5px"
            textTransform="uppercase"
            textAlign="center"
            lineHeight="19.2px"
          >
            Готові спробувати?
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "32px", md: "40px" }}
            color="#0d1b2e"
            letterSpacing="-0.5px"
            textAlign="center"
            lineHeight={{ base: "38px", md: "46px" }}
          >
            Давайте поговоримо про ваш
            <br />
            бізнес
          </Text>
          <Text pt="4px" fontSize="16px" color="#5a6a80" textAlign="center" lineHeight="27.2px">
            Розкажіть нам про свою мережу — і ми покажемо, як LvStore може допомогти саме
            <br />
            вам. Без зайвих обіцянок, лише конкретні відповіді.
          </Text>
          <Flex pt="26px" justify="center">
            <a
              href="#contacts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2274d4",
                border: "2px solid #2274d4",
                color: "white",
                borderRadius: "12px",
                padding: "15.5px 34px",
                fontWeight: 700,
                fontSize: 16,
                lineHeight: "25.6px",
                textDecoration: "none",
                fontFamily: "'Public Sans', sans-serif",
              }}
            >
              Зв&apos;язатись з нами
            </a>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
