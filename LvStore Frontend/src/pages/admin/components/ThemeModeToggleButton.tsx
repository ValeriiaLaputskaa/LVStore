import { Box, chakra } from "@chakra-ui/react";
import moonSvg from "../../../assets/theme-moon.svg?raw";
import sunSvg from "../../../assets/theme-sun.svg?raw";
import { useAdminTheme, useAdminThemeTokens } from "../theme/AdminThemeContext";

/**
 * Перемикач світла / темна тема для admin / seller / warehouse.
 * Іконка = режим після кліку (місяць → темна, сонце → світла).
 * Hover лише через фон кнопки — колір іконок (`currentColor`) не змінюється.
 */
export function ThemeModeToggleButton() {
  const { isDark, setMode } = useAdminTheme();
  const t = useAdminThemeTokens();

  const hoverBg = isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.07)";
  const activeBg = isDark ? "rgba(255,255,255,0.13)" : "rgba(15,23,42,0.1)";
  const idleBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const hoverBorder = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";

  return (
    <chakra.button
      type="button"
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      onClick={() => setMode(isDark ? "light" : "dark")}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="40px"
      h="40px"
      p={0}
      m={0}
      rounded="full"
      border="1px solid"
      borderColor={idleBorder}
      bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)"}
      color={t.titleColor}
      cursor="pointer"
      lineHeight={0}
      boxShadow={
        isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.04)"
          : "inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(15,23,42,0.06)"
      }
      transition="background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        bg: hoverBg,
        borderColor: hoverBorder,
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.06)"
          : "inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 3px rgba(15,23,42,0.08)",
      }}
      _active={{
        bg: activeBg,
        borderColor: hoverBorder,
      }}
      _focus={{ outline: "none" }}
      _focusVisible={{
        outline: "2px solid #2274d4",
        outlineOffset: "2px",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="20px"
        h="20px"
        color="inherit"
        dangerouslySetInnerHTML={{ __html: isDark ? sunSvg : moonSvg }}
        css={{
          "& svg": {
            display: "block",
            width: "20px",
            height: "20px",
            maxWidth: "100%",
            maxHeight: "100%",
          },
        }}
      />
    </chakra.button>
  );
}
