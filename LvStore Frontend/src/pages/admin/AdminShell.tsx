import { Box, Button, Drawer, Flex, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../api/authApi";
import { imgLogomark } from "../../assets/figmaAssets";
import { imgAdminLogomark } from "../../assets/figmaAdminAssets";
import { ADMIN_NAV, adminPageTitle } from "./adminNavConfig";
import { DesktopSidebarExpandRail } from "./components/DesktopSidebarExpandRail";
import { ThemeModeToggleButton } from "./components/ThemeModeToggleButton";
import { AdminSidebar, AdminSidebarContent } from "./AdminSidebar";
import { ShellBurgerIcon } from "./components/ShellBurgerIcon";
import { useShellSidebarCollapsed } from "./hooks/useShellSidebarCollapsed";
import { useAdminTheme, useAdminThemeTokens } from "./theme/AdminThemeContext";

export function AdminShell() {
  const location = useLocation();
  const title = adminPageTitle(location.pathname);
  const t = useAdminThemeTokens();
  const { isDark } = useAdminTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { collapsed: sidebarCollapsed, collapse: collapseSidebar, expand: expandSidebar } =
    useShellSidebarCollapsed("lvstore-sidebar-collapsed:admin");

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
      data-node-id="122:41"
    >
      <AdminSidebar collapsed={sidebarCollapsed} onRequestCollapse={collapseSidebar} />

      <DesktopSidebarExpandRail
        visible={sidebarCollapsed}
        sidebarBg={t.sidebarBg}
        onExpand={expandSidebar}
        navItems={ADMIN_NAV.map(({ to, label, icon }) => ({ to, label, icon }))}
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
                <AdminSidebarContent onNavigate={() => setMobileNavOpen(false)} />
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
          data-node-id="122:65"
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
              gap="8px"
              px="20px"
              py="10px"
              rounded="20px"
              bg={t.badgeBg}
              maxW={{ base: "min(100%, 140px)", sm: "min(100%, 260px)", md: "320px" }}
              minW={0}
              flexShrink={1}
            >
              <Box w="6px" h="6px" rounded="3px" bg={t.badgeDot} flexShrink={0} />
              <Text fontSize="sm" color={t.badgeText} truncate flex="1" minW={0}>
                {me?.username ?? me?.email ?? "—"}
              </Text>
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
