import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminColorMode = "light" | "dark";

export type AdminThemeTokens = {
  shellBg: string;
  headerBg: string;
  headerBorder: string;
  titleColor: string;
  mainBg: string;
  surface: string;
  surfaceBorder: string;
  tableHeaderBg: string;
  mutedText: string;
  headingText: string;
  inputBg: string;
  badgeBg: string;
  badgeText: string;
  badgeDot: string;
  tabListBorder: string;
  secondaryPanelBg: string;
  secondaryPanelBorder: string;
  secondaryPanelText: string;
  paginationBarBg: string;
  paginationBarBorder: string;
  paginationLabel: string;
  paginationInactiveBg: string;
  paginationInactiveBorder: string;
  paginationInactiveText: string;
  paginationHoverBg: string;
  sidebarBg: string;
};

const STORAGE_KEY = "lvstore-admin-color-mode";

function readStored(): AdminColorMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function getAdminThemeTokens(isDark: boolean): AdminThemeTokens {
  if (isDark) {
    return {
      shellBg: "#0f1419",
      headerBg: "#151d2b",
      headerBorder: "#2d3b52",
      titleColor: "#e2e8f0",
      mainBg: "#0f1419",
      surface: "#1a2332",
      surfaceBorder: "#2d3b52",
      tableHeaderBg: "#1e293b",
      mutedText: "#94a3b8",
      headingText: "#f1f5f9",
      inputBg: "#243044",
      badgeBg: "#1e3a5f",
      badgeText: "#cbd5e1",
      badgeDot: "#60a5fa",
      tabListBorder: "#2d3b52",
      secondaryPanelBg: "#1a2332",
      secondaryPanelBorder: "#2d3b52",
      secondaryPanelText: "#94a3b8",
      paginationBarBg: "#151d2b",
      paginationBarBorder: "#2d3b52",
      paginationLabel: "#94a3b8",
      paginationInactiveBg: "#1a2332",
      paginationInactiveBorder: "#3d4f66",
      paginationInactiveText: "#cbd5e1",
      paginationHoverBg: "#243044",
      sidebarBg: "#0c2544",
    };
  }
  return {
    shellBg: "#f4f6f9",
    headerBg: "#ffffff",
    headerBorder: "#e5e8ee",
    titleColor: "#111827",
    mainBg: "#f4f6f9",
    surface: "#ffffff",
    surfaceBorder: "#e5e8ee",
    tableHeaderBg: "#f8fafc",
    mutedText: "#64748b",
    headingText: "#111827",
    inputBg: "#ffffff",
    badgeBg: "#dbeafe",
    badgeText: "#64748b",
    badgeDot: "#3b82f6",
    tabListBorder: "#e5e8ee",
    secondaryPanelBg: "#ffffff",
    secondaryPanelBorder: "#e5e8ee",
    secondaryPanelText: "#475569",
    paginationBarBg: "#f9fafb",
    paginationBarBorder: "#f3f4f6",
    paginationLabel: "#6b7280",
    paginationInactiveBg: "#ffffff",
    paginationInactiveBorder: "#e5e7eb",
    paginationInactiveText: "#374151",
    paginationHoverBg: "#f9fafb",
    sidebarBg: "#2274d4",
  };
}

type AdminThemeContextValue = {
  mode: AdminColorMode;
  isDark: boolean;
  setMode: (m: AdminColorMode) => void;
  toggle: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AdminColorMode>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((m: AdminColorMode) => {
    setModeState(m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((m) => (m === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      setMode,
      toggle,
    }),
    [mode, setMode, toggle],
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme(): AdminThemeContextValue {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}

export function useAdminThemeTokens(): AdminThemeTokens {
  const { isDark } = useAdminTheme();
  return useMemo(() => getAdminThemeTokens(isDark), [isDark]);
}

/** Dialog surface + primary text (admin light/dark). */
export function adminDialogContentProps(t: AdminThemeTokens) {
  return {
    bg: t.surface,
    borderWidth: "1px" as const,
    borderColor: t.surfaceBorder,
    color: t.headingText,
  };
}

/** Table header cells use Chakra `fg` by default; override so they match body text in admin themes. */
export function adminTableColumnHeaderProps(t: AdminThemeTokens) {
  return { color: t.headingText };
}

/** «Скасувати» / «Закрити» on dialog — Chakra outline keeps global `fg` unless overridden. */
export function adminDialogOutlineButtonProps(t: AdminThemeTokens, isDark: boolean) {
  return {
    variant: "outline" as const,
    color: t.headingText,
    borderColor: t.surfaceBorder,
    _hover: {
      bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(15, 23, 42, 0.06)",
      borderColor: t.surfaceBorder,
    },
  };
}

/** Inputs / textareas inside admin dialogs and themed panels. */
export function adminThemedInputProps(t: AdminThemeTokens) {
  return {
    bg: t.inputBg,
    color: t.headingText,
    borderWidth: "1px" as const,
    borderColor: t.surfaceBorder,
    _placeholder: { color: t.mutedText },
  };
}

/**
 * Native `<select>`: closed field uses admin tokens; `color-scheme` + `option` rules help the
 * dropdown and selected value stay readable (UA support for `option` styling varies).
 */
export function adminNativeSelectFieldProps(t: AdminThemeTokens, isDark: boolean) {
  return {
    bg: t.inputBg,
    color: t.headingText,
    borderWidth: "1px" as const,
    borderColor: t.surfaceBorder,
    style: { colorScheme: isDark ? ("dark" as const) : ("light" as const) },
    css: {
      color: t.headingText,
      backgroundColor: t.inputBg,
      "& option, & optgroup": {
        backgroundColor: t.inputBg,
        color: t.headingText,
      },
    },
  };
}
