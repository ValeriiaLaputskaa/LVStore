import { Flex, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import type { CollapsedNavIconKind } from "../collapsedNavKinds";
import { CollapsedNavIconWrap } from "./CollapsedNavIcon";
import { SidebarIndentToggle } from "./SidebarIndentToggle";

export type CollapsedRailNavItem = {
  to: string;
  label: string;
  icon: CollapsedNavIconKind;
  end?: boolean;
};

export type DesktopSidebarExpandRailProps = {
  visible: boolean;
  sidebarBg: string;
  onExpand: () => void;
  navItems: CollapsedRailNavItem[];
};

/**
 * Вузька смуга (md+), коли сайдбар згорнуто: розгорнути + іконки розділів.
 * У розгорнутому сайдбарі не рендериться (`visible === false`).
 */
export function DesktopSidebarExpandRail({
  visible,
  sidebarBg,
  onExpand,
  navItems,
}: DesktopSidebarExpandRailProps) {
  if (!visible) return null;

  return (
    <Flex
      display={{ base: "none", md: "flex" }}
      direction="column"
      align="center"
      flexShrink={0}
      w="52px"
      minH="100vh"
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor="rgba(255,255,255,0.08)"
      pt={4}
      pb={4}
      zIndex={1}
    >
      <Flex flexShrink={0} pb={2}>
        <SidebarIndentToggle purpose="expand" onClick={onExpand} aria-label="Розгорнути бокову панель" />
      </Flex>

      <VStack
        as="nav"
        aria-label="Навігація (компактний режим)"
        gap="6px"
        flex="1"
        minH={0}
        w="full"
        align="center"
        overflowY="auto"
        overflowX="hidden"
        py={1}
        style={{ scrollbarWidth: "thin" }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            style={{ textDecoration: "none", width: "100%", display: "flex", justifyContent: "center" }}
          >
            {({ isActive }) => (
              <Flex
                w="40px"
                h="40px"
                align="center"
                justify="center"
                rounded="md"
                flexShrink={0}
                bg={isActive ? "rgba(255,255,255,0.14)" : "transparent"}
                borderLeft="3px solid"
                borderLeftColor={isActive ? "#4a9eff" : "transparent"}
                color={isActive ? "white" : "rgba(255,255,255,0.62)"}
                transition="background 0.15s ease, color 0.15s ease, border-color 0.15s ease"
                _hover={{
                  bg: isActive ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.1)",
                  color: "white",
                }}
              >
                <CollapsedNavIconWrap kind={item.icon} />
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>
    </Flex>
  );
}
