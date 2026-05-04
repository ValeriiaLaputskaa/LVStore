import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { imgSvg, imgSvg1, imgSvg2, imgSvg3 } from "../../../assets/figmaAssets";

function Bullet({
  title,
  body,
}: {
  title: string;
  body: string | string[];
}) {
  return (
    <Flex gap="14px" align="flex-start">
      <Box pt="6px" w="10px" flexShrink={0}>
        <Box bg="#2274d4" rounded="5px" boxSize="10px" />
      </Box>
      <Box>
        <Text fontWeight="medium" fontSize="15px" color="#0d1b2e" lineHeight="24px">
          {title}
        </Text>
        {Array.isArray(body) ? (
          body.map((line) => (
            <Text key={line} fontSize="13px" color="#5a6a80" lineHeight="19.5px">
              {line}
            </Text>
          ))
        ) : (
          <Text fontSize="13px" color="#5a6a80" lineHeight="19.5px">
            {body}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

export function MainAboutSection() {
  return (
    <Box id="about" bg="#f5f8fd" py={{ base: 12, md: "96px" }} pb={{ base: 12, md: "74px" }} scrollMarginTop="80px">
      <Box px={{ base: 6, md: "198px" }}>
        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
          gap={{ base: 10, lg: "72px" }}
          alignItems="center"
        >
          <Flex direction="column" gap="9px" maxW={{ lg: "486px" }}>
            <Text
              fontWeight="bold"
              fontSize="12px"
              color="#2274d4"
              letterSpacing="1.5px"
              textTransform="uppercase"
              lineHeight="19.2px"
            >
              Про нас
            </Text>
            <Text
              fontWeight="bold"
              fontSize={{ base: "28px", md: "36px" }}
              color="#0d1b2e"
              letterSpacing="-0.5px"
              lineHeight={{ base: "34px", md: "41.4px" }}
            >
              LvStore — продукт, який
              <br />
              вирішує реальну проблему
            </Text>
            <Text pt="4.8px" fontSize="16px" color="#5a6a80" lineHeight="28px">
              Ми створили LvStore, бо самі бачили, як мережі магазинів тонуть у таблицях Excel,
              мессенджерах і плутанині зі складськими залишками. Коли продавець не знає, що є на
              складі, а менеджер складу не знає, що вже продано — бізнес втрачає гроші щодня.
            </Text>
            <Text pt="4.8px" fontSize="16px" color="#5a6a80" lineHeight="28px">
              Наша відповідь — проста, практична система, де кожна роль
              <br />
              отримує рівно той інструмент, який їй потрібен. Без зайвого, без переускладнень.
            </Text>
            <Flex direction="column" gap="12px" pt="14.8px">
              <Bullet
                title="Простота замість функцій заради функцій"
                body={[
                  "Кожен екран — лише те, що потрібно конкретній людині для конкретної",
                  "задачі.",
                ]}
              />
              <Bullet
                title="Прозорість у команді"
                body={[
                  "Продавець, адміністратор і менеджер складу бачать єдину актуальну",
                  "картину — без затримок і непорозумінь.",
                ]}
              />
              <Bullet
                title="Надійна технологічна основа"
                body="Бекенд на Spring Boot, автентифікація — безпечно, стабільно, готово до масштабування."
              />
            </Flex>
          </Flex>

          <Grid templateColumns="repeat(2, 1fr)" gap="16px">
            <Box bg="#2274d4" border="1px solid #2274d4" rounded="16px" p="25px">
              <Flex bg="rgba(255,255,255,0.2)" rounded="12px" boxSize="44px" align="center" justify="center" mb="4.7px">
                <Image src={imgSvg} alt="" boxSize="20px" />
              </Flex>
              <Text pt="9.3px" fontWeight="bold" fontSize="15px" color="white" lineHeight="24px">
                Команда
              </Text>
              <Text fontSize="13px" color="rgba(255,255,255,0.8)" lineHeight="20.8px" mt="4.7px">
                Розроблено невеликою
                <br />
                командою, яка сама
                <br />
                зіткнулась з проблемами
                <br />
                управління товарами.
              </Text>
            </Box>
            <Box bg="white" border="1px solid #dde6f0" rounded="16px" p="25px" pb="45.8px">
              <Flex bg="#e8f0fc" rounded="12px" boxSize="44px" align="center" justify="center" mb="4.8px">
                <Image src={imgSvg1} alt="" boxSize="20px" />
              </Flex>
              <Text pt="9.2px" fontWeight="bold" fontSize="15px" color="#0d1b2e" lineHeight="24px">
                Швидкий старт
              </Text>
              <Text fontSize="13px" color="#5a6a80" lineHeight="20.8px" mt="4.8px">
                Від реєстрації до першого
                <br />
                замовлення — кілька годин, а не тижнів впровадження.
              </Text>
            </Box>
            <Box bg="white" border="1px solid #dde6f0" rounded="16px" p="25px">
              <Flex bg="#e8f0fc" rounded="12px" boxSize="44px" align="center" justify="center" mb="4.8px">
                <Image src={imgSvg2} alt="" boxSize="20px" />
              </Flex>
              <Text pt="9.2px" fontWeight="bold" fontSize="15px" color="#0d1b2e" lineHeight="24px">
                Безпека доступу
              </Text>
              <Text fontSize="13px" color="#5a6a80" lineHeight="20.8px" mt="4.8px">
                чітке розмежування ролей — кожен бачить тільки своє.
              </Text>
            </Box>
            <Box bg="white" border="1px solid #dde6f0" rounded="16px" p="25px">
              <Flex bg="#e8f0fc" rounded="12px" boxSize="44px" align="center" justify="center" mb="4.8px">
                <Image src={imgSvg3} alt="" boxSize="20px" />
              </Flex>
              <Text pt="9.2px" fontWeight="bold" fontSize="15px" color="#0d1b2e" lineHeight="24px">
                Реальний час
              </Text>
              <Text fontSize="13px" color="#5a6a80" lineHeight="20.8px" mt="4.8px">
                Статуси та замовлення
                <br />
                оновлюються миттєво для всіх учасників мережі.
              </Text>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
