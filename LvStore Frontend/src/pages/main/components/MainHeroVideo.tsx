import { Box, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

const VIDEO_SRC = "/videos/main-hero.mp4";

function PlayGlyph() {
  return (
    <Box as="span" display="inline-block" lineHeight={0} aria-hidden>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="13" fill="rgba(34,116,212,0.12)" stroke="#2274d4" strokeWidth="1.5" />
        <path d="M11 9.5 19 14l-8 4.5V9.5Z" fill="#2274d4" />
      </svg>
    </Box>
  );
}

/** Висота за aspect ratio відео (без crop). Ширина — колонка героя (до ~702px, Figma). */
export function MainHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  const syncPaused = useCallback(() => {
    const el = videoRef.current;
    if (el) setPaused(el.paused);
  }, []);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {
        /* autoplay policy / decode */
      });
    } else {
      el.pause();
    }
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onPause = () => setPaused(true);
    const onPlay = () => setPaused(false);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);
    void el.play().catch(() => setPaused(true));
    syncPaused();
    return () => {
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, [syncPaused]);

  return (
    <Box
      position="relative"
      w="full"
      maxW="100%"
      mx={{ base: "auto", lg: "unset" }}
      rounded="20px"
      overflow="hidden"
      boxShadow="0px 8px 40px 0px rgba(34,116,212,0.1)"
      border="1px solid #dde6f0"
      bg="#0d1b2e"
      cursor="pointer"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={
        paused
          ? "Відео на паузі. Натисніть або Enter, щоб відтворити"
          : "Відео відтворюється. Натисніть або Enter, щоб поставити на паузу"
      }
      userSelect="none"
      style={{ WebkitTapHighlightColor: "transparent" } satisfies CSSProperties}
    >
      <Box position="relative" w="full" lineHeight={0}>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            display: "block",
            verticalAlign: "top",
            pointerEvents: "none",
          }}
        />

        {paused ? (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            direction="column"
            gap="12px"
            bg="rgba(13,27,46,0.42)"
            pointerEvents="none"
            backdropFilter="blur(2px)"
            zIndex={1}
          >
            <PlayGlyph />
            <Flex direction="column" align="center" gap="14px" textAlign="center" px={2}>
              <Text
                fontFamily="'Public Sans', sans-serif"
                fontWeight="semibold"
                fontSize="15px"
                lineHeight="1.55"
                color="white"
                textShadow="0 1px 4px rgba(0,0,0,0.45)"
              >
                Пауза
              </Text>
              <Text
                fontSize="13px"
                lineHeight="1.65"
                color="rgba(255,255,255,0.85)"
                textShadow="0 1px 3px rgba(0,0,0,0.4)"
              >
                Натисніть, щоб продовжити
              </Text>
            </Flex>
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
}
