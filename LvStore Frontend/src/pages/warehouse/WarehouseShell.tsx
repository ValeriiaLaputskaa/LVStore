import { Box, Button, Drawer, Flex, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";
import { imgLogomark } from "../../assets/figmaAssets";
import { imgAdminLogomark } from "../../assets/figmaAdminAssets";
import { DesktopSidebarExpandRail } from "../admin/components/DesktopSidebarExpandRail";
import { ShellBurgerIcon } from "../admin/components/ShellBurgerIcon";
import { ThemeModeToggleButton } from "../admin/components/ThemeModeToggleButton";
import { useShellSidebarCollapsed } from "../admin/hooks/useShellSidebarCollapsed";
import { useAdminTheme, useAdminThemeTokens } from "../admin/theme/AdminThemeContext";
import { WAREHOUSE_NAV, warehousePageTitle } from "./warehouseNavConfig";
import { WarehouseSidebar, WarehouseSidebarContent } from "./WarehouseSidebar";

export function WarehouseShell() {
  const location = useLocation();
  const title = warehousePageTitle(location.pathname);
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { collapsed: sidebarCollapsed, collapse: collapseSidebar, expand: expandSidebar } =
    useShellSidebarCollapsed("lvstore-sidebar-collapsed:warehouse");

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const { data: me } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: 30_000,
  });

  return (
    <Flex
      minH="100vh"
      direction="row"
      align="stretch"
      bg={t.shellBg}
      fontFamily="'Public Sans', 'Noto Sans', sans-serif"
    >
      <WarehouseSidebar collapsed={sidebarCollapsed} onRequestCollapse={collapseSidebar} />

      <DesktopSidebarExpandRail
        visible={sidebarCollapsed}
        sidebarBg={t.sidebarBg}
        onExpand={expandSidebar}
        navItems={WAREHOUSE_NAV.map(({ to, label, icon }) => ({ to, label, icon, end: true }))}
      />

      <Drawer.Root
        open={mobileNavOpen}
        onOpenChange={(e) => setMobileNavOpen(e.open)}
        placement="start"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            w="min(280px, 88vw)"
            maxW="280px"
            h="100dvh"
            bg={t.sidebarBg}
            p={0}
            rounded="0"
            borderWidth={0}
            boxShadow="lg"
          >
            <Drawer.Body p={0} display="flex" flexDirection="column" h="full" overflow="hidden">
              <Flex align="center" justify="flex-end" px={3} pt={3} flexShrink={0}>
                <Drawer.CloseTrigger asChild>
                  <Button size="sm" variant="ghost" color="white" aria-label="Закрити меню">
                    ✕
                  </Button>
                </Drawer.CloseTrigger>
              </Flex>
              <Box flex="1" minH={0} overflowY="auto" display="flex" flexDirection="column">
                <WarehouseSidebarContent onNavigate={() => setMobileNavOpen(false)} />
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>

      <Flex direction="column" flex="1" minW={0} minH={0}>
        <Flex
          h="60px"
          px={{ base: 4, md: "28px" }}
          align="center"
          justify="space-between"
          gap={3}
          borderBottom="1px solid"
          borderColor={t.headerBorder}
          bg={t.headerBg}
          flexShrink={0}
        >
          <Flex align="center" gap={3} minW={0} flex="1">
            <Flex display={{ base: "flex", md: "none" }} align="center" gap={1} flexShrink={0}>
              <Button
                aria-label="Відкрити меню"
                variant="ghost"
                size="sm"
                px={2}
                onClick={() => setMobileNavOpen(true)}
                color={t.titleColor}
              >
                <ShellBurgerIcon />
              </Button>
              <NavLink to="/" style={{ textDecoration: "none" }} aria-label="На головну">
                <Flex align="center" gap="4px" h="28px">
                  <Box position="relative" boxSize="24px" flexShrink={0}>
                    <Image
                      src={isDark ? imgAdminLogomark : imgLogomark}
                      alt=""
                      position="absolute"
                      inset={0}
                      w="full"
                      h="full"
                    />
                  </Box>
                  <Text
                    fontFamily="'Public Sans', sans-serif"
                    fontWeight="bold"
                    fontSize="18px"
                    lineHeight={1}
                    letterSpacing="-0.5px"
                    color={isDark ? "white" : "#2274d4"}
                  >
                    LvStore
                  </Text>
                </Flex>
              </NavLink>
            </Flex>

            <Text
              fontWeight="semibold"
              fontSize="16px"
              color={t.titleColor}
              lineClamp={2}
              minW={0}
              flex="1"
            >
              {title}
            </Text>
          </Flex>
          <Flex align="center" gap={3} flexShrink={0}>
            <Flex
              align="center"
              gap="7px"
              px={{ base: "11px", sm: "13px" }}
              py={{ base: "5px", sm: "6px" }}
              rounded="16px"
              bg={t.badgeBg}
              maxW={{ base: "min(100%, 140px)", sm: "min(100%, 260px)", md: "300px" }}
              minW={0}
              flexShrink={1}
            >
              <Box w="6px" h="6px" rounded="3px" bg={t.badgeDot} flexShrink={0} alignSelf="center" aria-hidden />
              <Flex direction="column" minW={0} flex="1" gap="1px" justify="center">
                <Text
                  fontSize="13px"
                  lineHeight="1.2"
                  fontWeight="medium"
                  color={t.badgeText}
                  truncate
                  title={(me?.username ?? me?.email) || undefined}
                >
                  {me?.username ?? me?.email ?? "—"}
                </Text>
                <Text
                  fontSize="10px"
                  lineHeight="1.2"
                  color={t.mutedText}
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                  whiteSpace="nowrap"
                >
                  Менеджер складу
                </Text>
              </Flex>
            </Flex>
            <ThemeModeToggleButton />
          </Flex>
        </Flex>
        <Box as="main" flex="1" minH={0} p={{ base: 4, md: 6 }} overflow="auto" bg={t.mainBg}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
