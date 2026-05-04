import { Box, Flex } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const { pathname } = useLocation();
  const showSidebar = pathname !== "/";

  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="#f5f8fd"
      fontFamily="'Public Sans', 'Noto Sans', sans-serif"
    >
      <TopBar />
      <Flex flex="1" align="stretch" minH={0}>
        {showSidebar ? <Sidebar /> : null}
        <Box as="main" flex="1" minW={0}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
