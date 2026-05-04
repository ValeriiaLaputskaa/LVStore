import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import {
  imgGroup,
  imgMaterialSymbolsDocsOutline,
  imgMaterialSymbolsOrderApproveOutlineRounded,
  imgMaterialSymbolsShieldOutline,
  imgSvg4,
  imgSvg5,
  imgSvg6,
  imgSvg7,
} from "../../../assets/figmaAssets";

const cards = [
  {
    key: "products",
    gradient: "linear-gradient(129.12deg, #e8f0fc 0%, #d0e4f8 100%)",
    illustration: imgSvg4,
    icon: imgMaterialSymbolsDocsOutline,
    title: "Управління товарами",
    body:
      "Додавайте, редагуйте й переміщуйте товари між точками продажу за лічені секунди. Повний каталог завжди під рукою — незалежно від кількості магазинів у мережі.",
  },
  {
    key: "stock",
    gradient: "linear-gradient(129.12deg, #eaf3de 0%, #c8e6b0 100%)",
    illustration: imgSvg6,
    icon: imgMaterialSymbolsShieldOutline,
    title: "Контроль залишків",
    body: [
      "Система сама відстежує рівень запасів і повідомляє, коли товар",
      "наближається до критичної позначки. Жодної втраченої угоди через порожню полицю.",
    ],
  },
  {
    key: "orders",
    gradient: "linear-gradient(129.12deg, #faeeda 0%, #f5d9a0 100%)",
    illustration: imgSvg5,
    icon: imgMaterialSymbolsOrderApproveOutlineRounded,
    title: "Обробка замовлень",
    body:
      "Від прийому до відправлення — весь процес у прозорому інтерфейсі. Кожен учасник команди бачить актуальний статус і знає, що робити далі.",
  },
  {
    key: "unified",
    gradient: "linear-gradient(129.12deg, #f0eafc 0%, #d8c8f5 100%)",
    illustration: imgSvg7,
    customIcon: "group" as const,
    title: "Магазини і склади — як одне ціле",
    body: [
      "Дані між усіма точками продажу й складами синхронізуються в",
      "реальному часі. Більше жодних розбіжностей між тим, що є на папері, і тим, що є насправді.",
    ],
  },
] as const;

export function MainFeaturesSection() {
  return (
    <Box id="advantages" bg="white" scrollMarginTop="80px">
      <Box maxW="1140px" mx="auto" px={{ base: 6, md: "48px" }} pt="60px" pb="88px">
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
            переваги
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "28px", md: "36px" }}
            color="#0d1b2e"
            letterSpacing="-0.5px"
            textAlign="center"
            lineHeight={{ base: "34px", md: "41.4px" }}
          >
            Усе, що потрібно для роботи
          </Text>
          <Box maxW="520px" pt="3px" textAlign="center">
            <Text fontSize="16px" color="#5a6a80" lineHeight="27.2px">
              Ми зібрали в одній платформі саме те, чого бракує більшості
              <br />
              роздрібних мереж — прозорість, контроль і простота.
            </Text>
          </Box>
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
          gap="24px"
        >
          {cards.map((c) => (
            <Box
              key={c.key}
              bg="white"
              border="1px solid #dde6f0"
              rounded="18px"
              overflow="hidden"
            >
              <Flex h="300px" bgImage={c.gradient} align="center" justify="center" p="32px">
                <Image src={c.illustration} alt="" w="260px" h="130px" objectFit="contain" />
              </Flex>
              <Box px="28px" py="24px">
                <Flex
                  bg="#e8f0fc"
                  rounded="12px"
                  boxSize="48px"
                  align="center"
                  justify="center"
                  mb="6.8px"
                >
                  {"customIcon" in c && c.customIcon === "group" ? (
                    <Box w="24px" h="24px" position="relative">
                      <Image src={imgGroup} alt="" w="full" h="full" objectFit="contain" />
                    </Box>
                  ) : "icon" in c ? (
                    <Image src={c.icon} alt="" boxSize="24px" />
                  ) : null}
                </Flex>
                <Text
                  pt="7.2px"
                  fontWeight="bold"
                  fontSize="20px"
                  color="#0d1b2e"
                  lineHeight="32px"
                  mb="6.8px"
                >
                  {c.title}
                </Text>
                {Array.isArray(c.body) ? (
                  c.body.map((line) => (
                    <Text key={line} fontSize="14px" color="#5a6a80" lineHeight="23.8px">
                      {line}
                    </Text>
                  ))
                ) : (
                  <Text fontSize="14px" color="#5a6a80" lineHeight="23.8px">
                    {c.body}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
