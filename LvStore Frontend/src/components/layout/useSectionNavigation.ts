import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { SectionHash } from "./navConfig";


export function useSectionNavigation() {
  const navigate = useNavigate();

  return useCallback((hash: SectionHash) => {
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    void navigate({ pathname: "/", hash }, { preventScrollReset: true });
  }, [navigate]);
}
