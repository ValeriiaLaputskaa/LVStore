import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MainHeroVideo } from "./MainHeroVideo";

const HERO_HEADING_PREFIX = "під ";

const HERO_HEADING_LINE_PX = { base: 42, md: 52.8, lg: 52.8 } as const;

const HERO_TYPEWRITER_MIN_H = {
  base: `${HERO_HEADING_LINE_PX.base * 2}px`,
  md: `${HERO_HEADING_LINE_PX.md * 2}px`,
  lg: `${HERO_HEADING_LINE_PX.lg}px`,
};

const HERO_TYPEWRITER_PHRASES = [
  "під повним контролем",
  "під надійним захистом",
  "під повною прозорістю",
  "під єдиним управлінням",
  "під повною автоматизацією",
  "під точним моніторингом",
  "під ефективним керуванням",
  "під повною синхронізацією",
  "під чіткою аналітикою",
] as const;

function useMainHeroTypewriter(): string {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const phrases = HERO_TYPEWRITER_PHRASES;

    const run = () => {
      if (cancelled) return;
      const phrase = phrases[phraseIdx % phrases.length];
      if (!deleting) {
        if (charIdx < phrase.length) {
          charIdx += 1;
          setText(phrase.slice(0, charIdx));
          timer = setTimeout(run, 72);
        } else {
          timer = setTimeout(() => {
            deleting = true;
            run();
          }, 1600);
        }
      } else if (charIdx > 0) {
        charIdx -= 1;
        setText(phrase.slice(0, charIdx));
        timer = setTimeout(run, 32);
      } else {
        deleting = false;
        phraseIdx += 1;
        timer = setTimeout(run, 450);
      }
    };

    timer = setTimeout(run, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return text;
}

export function MainHeroSection() {
  const heroTw = useMainHeroTypewriter();
  const prefixLen = Math.min(heroTw.length, HERO_HEADING_PREFIX.length);
  const darkPart = heroTw.slice(0, prefixLen);
  const bluePart = heroTw.slice(HERO_HEADING_PREFIX.length);

  return (
    <Box bg="white" pt={{ base: 10, md: "88px" }} pb={{ base: 10, md: "72px" }}>
      <Box
        /* Лише контейнер: більше ширини рядка — перша колонка (текст/typewriter) ширша, без змін у самому typewriter */
        maxW={{ base: "1140px", lg: "min(100%, 1240px)", xl: "min(100%, 1360px)", "2xl": "min(100%, 1480px)" }}
        mx="auto"
        px={{ base: 4, sm: 6, md: "48px" }}
      >
        <Grid
          templateColumns={{
            base: "1fr",
            /* Вужча колонка під відео → більше місця для рядка typewriter; без `auto`, щоб не ламати першу колонку */
            lg: "minmax(0, 1fr) minmax(0, 440px)",
            xl: "minmax(0, 1fr) minmax(0, 520px)",
            "2xl": "minmax(0, 1fr) minmax(0, 620px)",
          }}
          gap={{ base: 10, lg: "72px", xl: "88px", "2xl": "96px" }}
          alignItems={{ base: "stretch", lg: "start" }}
        >
          <Flex direction="column" gap="20px" maxW="100%" pr={{ lg: 2, xl: 4 }}>
            <Flex
              align="center"
              gap="8px"
              bg="#e8f0fc"
              rounded="100px"
              py="5px"
              px="16px"
              w={{ base: "100%", sm: "fit-content" }}
              maxW="100%"
            >
              <Box bg="#2274d4" rounded="3.5px" boxSize="7px" flexShrink={0} />
              <Text
                fontFamily="'Public Sans', sans-serif"
                fontWeight="bold"
                fontSize="14px"
                color="#2274d4"
                lineHeight="22.4px"
                whiteSpace={{ base: "normal", sm: "nowrap" }}
              >
                Система управління мережею магазинів
              </Text>
            </Flex>

            <Box maxW="100%">
              <Text
                fontFamily="'Public Sans', sans-serif"
                fontWeight="bold"
                fontSize={{ base: "36px", md: "48px" }}
                color="#0d1b2e"
                letterSpacing="-1px"
                lineHeight={{ base: "42px", md: "52.8px" }}
              >
                Ваш бізнес —
              </Text>
              <Text
                as="div"
                aria-live="polite"
                aria-atomic="true"
                fontFamily="'Public Sans', sans-serif"
                fontWeight="bold"
                fontSize={{ base: "36px", md: "48px", lg: "clamp(34px, 3.3vw, 48px)" }}
                letterSpacing={{ base: "-1px", lg: "-0.9px" }}
                lineHeight={{ base: "42px", md: "52.8px" }}
                minH={HERO_TYPEWRITER_MIN_H}
                maxW="100%"
                whiteSpace={{ base: "normal", lg: "nowrap" }}
                overflow="hidden"
                pe={{ lg: "0.26em" }}
                overflowWrap="break-word"
                wordBreak="normal"
              >
                <Box as="span" display="inline" color="#0d1b2e">
                  {darkPart}
                </Box>
                <Box as="span" display="inline" color="#2274d4">
                  {bluePart}
                </Box>
              </Text>
            </Box>

            <Box maxW="440px">
              <Text fontSize="16px" color="#5a6a80" lineHeight="28px">
                LvStore — це платформа, яка об&apos;єднує ваші магазини, склади й команду в єдиній
                системі. Ми зробили так, щоб ви витрачали менше часу на рутину і більше — на розвиток.
              </Text>
            </Box>

            <Box pt="16px">
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
            </Box>
          </Flex>

          <Flex w="full" minW={0} justify={{ base: "stretch", lg: "flex-end" }} align="flex-start">
            {/* Відео притиснуте вправо в межах колонки — зліва в комірці лишається «відступ» від тексту */}
            <Box w="100%" maxW="100%">
              <MainHeroVideo />
            </Box>
          </Flex>
        </Grid>
      </Box>
    </Box>
  );
}
