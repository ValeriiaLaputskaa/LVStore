import { Box } from "@chakra-ui/react";

export function ShellBurgerIcon() {
  return (
    <Box as="span" display="block" w="20px" color="currentColor" aria-hidden>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
      </svg>
    </Box>
  );
}
