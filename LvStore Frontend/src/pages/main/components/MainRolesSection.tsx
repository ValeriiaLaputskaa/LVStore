import { Box, Button, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { imgSvg10, imgSvg8, imgSvg9 } from "../../../assets/figmaAssets";

const roles = [
  {
    key: "seller",
    gradient: "linear-gradient(135deg, #dceefb 0%, #b5d4f4 100%)",
    illu: imgSvg8,
    illuW: "120px",
    badgeBg: "#e8f0fc",
    badgeBorder: "white",
    letter: "П",
    letterColor: "#2274d4",
    title: "Продавець",
    desc: [
      "Бачить актуальний каталог, оформлює",
      "замовлення та відстежує їх статус. Нічого",
      "зайвого — лише те, що потрібно для",
      "продажу тут і зараз.",
    ],
    bullets: ["Перегляд товарів і цін", "Оформлення замовлень", "Статуси доставки"],
  },
  {
    key: "admin",
    gradient: "linear-gradient(135deg, #d6edca 0%, #a8d880 100%)",
    illu: imgSvg9,
    illuW: "120px",
    badgeBg: "#eaf3de",
    badgeBorder: "white",
    letter: "А",
    letterColor: "#3b6d11",
    title: "Адміністратор",
    desc: [
      "Керує асортиментом, стежить за",
      "залишками й аналізує продажі. Має повний огляд магазину, від конкретного товару до загальної динаміки.",
    ] as const,
    bullets: ["Управління товарами", "Контроль залишків", "Звіти та аналітика"],
  },
  {
    key: "warehouse",
    gradient: "linear-gradient(135deg, #faeeda 0%, #f5c97a 100%)",
    illu: imgSvg10,
    illuW: "140px",
    badgeBg: "#faeeda",
    badgeBorder: "white",
    letter: "М",
    letterColor: "#854f0b",
    title: "Менеджер складу",
    desc: [
      "Приймає поставки, переміщує товари між складами й магазинами, підтримує порядок у запасах. Його робота — щоб на полицях завжди було що продати.",
    ] as const,
    bullets: ["Облік поставок", "Переміщення товарів", "Управління запасами"],
  },
] as const;

export function MainRolesSection() {
  return (
    <Box id="roles" bg="#f5f8fd" py={{ base: 10, md: "15px" }} pb={{ base: 12, md: "60px" }} scrollMarginTop="80px">
      <Box maxW="1140px" mx="auto" px={{ base: 6, md: "48px" }}>
        <Flex direction="column" gap="9px" align="center" mb="56px">
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="#2274d4"
            letterSpacing="1.5px"
            textTransform="uppercase"
            textAlign="center"
            lineHeight="19.2px"
          >
            Ролі в системі
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "28px", md: "36px" }}
            color="#0d1b2e"
            letterSpacing="-0.5px"
            textAlign="center"
            lineHeight={{ base: "34px", md: "41.4px" }}
          >
            Кожен працює у своєму просторі
          </Text>
          <Box maxW="520px" pt="3px" textAlign="center">
            <Text fontSize="16px" color="#5a6a80" lineHeight="27.2px">
              LvStore розроблений для трьох типів користувачів — і кожен отримує
              <br />
              рівно той функціонал, який потрібен для роботи, без зайвого.
            </Text>
          </Box>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="24px">
          {roles.map((r) => (
            <Box
              key={r.key}
              bg="white"
              border="1px solid #dde6f0"
              rounded="18px"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              alignItems="center"
              pb="39px"
            >
              <Flex h="200px" w="100%" bgImage={r.gradient} align="center" justify="center">
                <Image src={r.illu} alt="" h="130px" w={r.illuW} objectFit="contain" />
              </Flex>
              <Box w="100%" px={{ base: 4, md: "24px" }} pb="38px">
                <Flex
                  bg={r.badgeBg}
                  border="3px solid"
                  borderColor={r.badgeBorder}
                  rounded="26px"
                  boxSize="52px"
                  align="center"
                  justify="center"
                  mt="-14px"
                >
                  <Text fontWeight="bold" fontSize="20px" color={r.letterColor} lineHeight="32px">
                    {r.letter}
                  </Text>
                </Flex>
                <Text
                  pt="8.9px"
                  fontWeight="bold"
                  fontSize="20px"
                  color="#0d1b2e"
                  lineHeight="32px"
                >
                  {r.title}
                </Text>
                <Text fontSize="14px" color="#5a6a80" lineHeight="23.1px" mt="5.1px">
                  {r.desc.map((line, i) => (
                    <Box as="span" key={i} display="block">
                      {line}
                    </Box>
                  ))}
                </Text>
                <Flex direction="column" gap={0} pt="12.9px" w="100%">
                  {r.bullets.map((b, i) => (
                    <Flex
                      key={b}
                      gap="10px"
                      align="center"
                      borderBottom={i < r.bullets.length - 1 ? "1px solid #f0f4f8" : undefined}
                      py="5.5px"
                      pb={i < r.bullets.length - 1 ? "6.89px" : "5.89px"}
                    >
                      <Box bg="#2274d4" rounded="3px" boxSize="6px" flexShrink={0} />
                      <Text fontSize="14px" color="#5a6a80" lineHeight="22.4px">
                        {b}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
              <Button
                variant="outline"
                border="2px solid #2274d4"
                color="#2274d4"
                rounded="10px"
                w={{ base: "100%", sm: "282px" }}
                maxW="100%"
                px="26px"
                py="12px"
                h="auto"
                fontWeight="bold"
                fontSize="16px"
                lineHeight="25.6px"
                bg="transparent"
                _hover={{ bg: "#e8f0fc" }}
              >
                Дізнатись більше
              </Button>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
