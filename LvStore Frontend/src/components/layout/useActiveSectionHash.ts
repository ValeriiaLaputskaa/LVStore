import { useMemo, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { mainNavItems, type SectionHash } from "./navConfig";

const HEADER_SCROLL_OFFSET = 88;

const validHashes = new Set<string>(mainNavItems.map((i) => i.hash));

function parseHash(rawHash: string): SectionHash | null {
  const raw = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  if (!raw || !validHashes.has(raw)) return null;
  return raw as SectionHash;
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrollY(): number {
  return window.scrollY;
}

function getServerScrollY(): number {
  return 0;
}


export function useActiveSectionHash(): SectionHash | null {
  const { hash, pathname } = useLocation();
  const scrollY = useSyncExternalStore(subscribeScroll, getScrollY, getServerScrollY);

  return useMemo(() => {
    if (pathname !== "/") return null;

    const pos = scrollY + HEADER_SCROLL_OFFSET;
    let scrollBased: SectionHash | null = null;
    for (const id of mainNavItems.map((i) => i.hash)) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.offsetTop <= pos) {
        scrollBased = id;
      }
    }

    const fromHash = parseHash(hash);
    return scrollBased ?? fromHash ?? null;
  }, [scrollY, hash, pathname]);
}
