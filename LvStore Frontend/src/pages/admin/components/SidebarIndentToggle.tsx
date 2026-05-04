import { Box, chakra } from "@chakra-ui/react";
import indentSvg from "../../../assets/sidebar-indent-toggle.svg?raw";

export type SidebarIndentTogglePurpose = "collapse" | "expand";

export type SidebarIndentToggleProps = {
  purpose: SidebarIndentTogglePurpose;
  onClick: () => void;
  "aria-label": string;
};

/**
 * Іконка згортання / розгортання сайдбару (Streamline Left-Indent-Alt).
 * `expand` — віддзеркалена по горизонталі, щоб читалась як «повернути панель».
 */
export function SidebarIndentToggle({ purpose, onClick, "aria-label": ariaLabel }: SidebarIndentToggleProps) {
  const flip = purpose === "expand";

  return (
    <chakra.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="40px"
      h="40px"
      p={0}
      rounded="full"
      border="1px solid"
      borderColor="rgba(255,255,255,0.12)"
      bg="rgba(255,255,255,0.06)"
      color="rgba(255,255,255,0.92)"
      cursor="pointer"
      lineHeight={0}
      transition="background-color 0.18s ease, border-color 0.18s ease"
      _hover={{
        bg: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.2)",
      }}
      _active={{
        bg: "rgba(255,255,255,0.16)",
      }}
      _focus={{ outline: "none" }}
      _focusVisible={{
        outline: "2px solid #4a9eff",
        outlineOffset: "2px",
      }}
    >
      <Box
        color="inherit"
        dangerouslySetInnerHTML={{ __html: indentSvg }}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: flip ? "scaleX(-1)" : undefined,
          "& svg": {
            display: "block",
            width: "16px",
            height: "16px",
          },
        }}
      />
    </chakra.button>
  );
}
