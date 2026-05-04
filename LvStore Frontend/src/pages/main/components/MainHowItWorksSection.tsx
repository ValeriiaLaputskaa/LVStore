import { Box, Flex, Grid, Text } from "@chakra-ui/react";

const steps = [
  {
    n: "1",
    title: "Залишіть заявку",
    lines: [
      "Напишіть нам — ми зв\u2019яжемось,",
      "розповімо деталі й підберемо",
      "оптимальний формат для вашої",
      "мережі",
    ],
  },
  {
    n: "2",
    title: "Підключіть магазини",
    lines: [
      "Додайте свої торгові точки й склади",
      "до єдиного простору — це займе не",
      "більше кількох хвилин",
    ],
  },
  {
    n: "3",
    title: "Завантажте товари",
    lines: [
      "Імпортуйте каталог з Excel або",
      "заповніть вручну — система гнучко",
      "адаптується під ваші дані",
    ],
  },
  {
    n: "4",
    title: "Починайте роботу",
    lines: [
      "Ваша команда отримує доступ і",
      "одразу може працювати. Ми поруч,",
      "якщо виникнуть питання",
    ],
  },
] as const;

export function MainHowItWorksSection() {
  return (
    <Box id="start" bg="#2274d4" py="60px" px={{ base: 6, md: "150px" }} scrollMarginTop="80px">
      <Box maxW="1140px" mx="auto" px={{ base: 0, md: "48px" }}>
        <Flex direction="column" gap="9px" align="center" mb="56px">
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="rgba(255,255,255,0.7)"
            letterSpacing="1.5px"
            textTransform="uppercase"
            textAlign="center"
            lineHeight="19.2px"
          >
            Як розпочати
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "28px", md: "36px" }}
            color="white"
            letterSpacing="-0.5px"
            textAlign="center"
            lineHeight={{ base: "34px", md: "41.4px" }}
          >
            Чотири кроки — і ви в системі
          </Text>
          <Box maxW="520px" pt="3px" textAlign="center">
            <Text fontSize="16px" color="rgba(255,255,255,0.75)" lineHeight="27.2px">
              Ніяких довгих впроваджень і складних налаштувань. Ми зробили так,
              <br />
              щоб старт займав години, а не тижні.
            </Text>
          </Box>
        </Flex>

        <Box position="relative">
          <Box
            display={{ base: "none", md: "block" }}
            position="absolute"
            left="12%"
            right="12%"
            top="28px"
            h="1.5px"
            bg="rgba(255,255,255,0.2)"
          />
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="24px">
            {steps.map((st) => (
              <Flex key={st.n} direction="column" align="center" gap="7.1px" pb={{ md: "23.1px" }}>
                <Flex
                  rounded="28px"
                  boxSize="56px"
                  align="center"
                  justify="center"
                  border="2px solid rgba(255,255,255,0.4)"
                  bg="rgba(255,255,255,0.15)"
                  p="2px"
                >
                  <Text
                    fontFamily="'Public Sans', sans-serif"
                    fontWeight="extrabold"
                    fontSize="20px"
                    color="white"
                    lineHeight="32px"
                  >
                    {st.n}
                  </Text>
                </Flex>
                <Text
                  pt="10.9px"
                  fontWeight="bold"
                  fontSize="16px"
                  color="white"
                  textAlign="center"
                  lineHeight="25.6px"
                >
                  {st.title}
                </Text>
                <Text fontSize="14px" color="rgba(255,255,255,0.75)" textAlign="center" lineHeight="23.1px">
                  {st.lines.map((line) => (
                    <Box as="span" key={line} display="block">
                      {line}
                    </Box>
                  ))}
                </Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
