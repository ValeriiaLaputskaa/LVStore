import { Box } from "@chakra-ui/react";
import spinnerSvg from "../../assets/lvstore-login-spinner.svg?raw";

/** Анімований «LvStore» з `lvstore-login-spinner.svg` (вбудовані keyframes у SVG). */
export function LvStoreLoginSpinner() {
  return (
    <Box
      lineHeight={0}
      w="188px"
      maxW="min(188px, 85vw)"
      mx="auto"
      dangerouslySetInnerHTML={{ __html: spinnerSvg }}
    />
  );
}
