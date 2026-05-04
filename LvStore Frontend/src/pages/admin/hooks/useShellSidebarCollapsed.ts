import { useCallback, useEffect, useState } from "react";

function readCollapsed(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}


export function useShellSidebarCollapsed(storageKey: string) {
  const [collapsed, setCollapsed] = useState(() => readCollapsed(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [storageKey, collapsed]);

  const collapse = useCallback(() => setCollapsed(true), []);
  const expand = useCallback(() => setCollapsed(false), []);

  return { collapsed, collapse, expand };
}
