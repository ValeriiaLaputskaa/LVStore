import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { CollapsedNavIconKind } from "../collapsedNavKinds";

const STROKE = 1.65;

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Мінімальні outline-іконки під розділи (currentColor). */
export function CollapsedNavIcon({ kind }: { kind: CollapsedNavIconKind }) {
  switch (kind) {
    case "overview":
      return (
        <IconSvg>
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
        </IconSvg>
      );
    case "products":
      return (
        <IconSvg>
          <path
            d="M12 3.5 20 8v8l-8 4.5-8-4.5V8l8-4.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M12 12 20 8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <path d="M12 12v9.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <path d="M12 12 4 8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </IconSvg>
      );
    case "orders":
      return (
        <IconSvg>
          <path
            d="M8 4h11a1 1 0 0 1 1 1v15H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M10 9h7M10 13h7M10 17h4" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </IconSvg>
      );
    case "storesUsers":
      return (
        <IconSvg>
          <circle cx="9" cy="9" r="2.75" stroke="currentColor" strokeWidth={STROKE} />
          <circle cx="16" cy="8" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
          <path
            d="M5 19c0-2.5 2-4 4-4s2.5.6 4.5 1.2S18 16.5 18 19"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d="M4 6h6l1 2h9v11H4V6Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
        </IconSvg>
      );
    case "warehouses":
      return (
        <IconSvg>
          <path
            d="M4 10 12 5l8 5v11H4V10Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M10 21v-7h4v7" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
        </IconSvg>
      );
    case "warehouseStocks":
      return (
        <IconSvg>
          <path
            d="M5 6h14v15H5V6Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M5 11h14M5 16h14" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <path d="M9 16v5M14 16v5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </IconSvg>
      );
    case "shopStocks":
      return (
        <IconSvg>
          <path d="M4 10h16v11H4V10Z" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
          <path d="M3 10 12 5l9 5" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
          <path d="M9 14h6M9 17h4" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </IconSvg>
      );
    default:
      return null;
  }
}

export function CollapsedNavIconWrap({ kind }: { kind: CollapsedNavIconKind }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" lineHeight={0}>
      <CollapsedNavIcon kind={kind} />
    </Box>
  );
}
