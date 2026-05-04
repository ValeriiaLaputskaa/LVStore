import { Box, Button, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { imgAdminLogomark, imgAdminNavActive, imgAdminNavIdle } from "../../assets/figmaAdminAssets";
import { SidebarIndentToggle } from "../admin/components/SidebarIndentToggle";
import { useAdminThemeTokens } from "../admin/theme/AdminThemeContext";
import { WAREHOUSE_NAV } from "./warehouseNavConfig";
import { useWarehouseLogout } from "./useWarehouseLogout";

const sidebarW = "240px";

export type WarehouseSidebarContentProps = {
  onNavigate?: () => void;
  onRequestCollapse?: () => void;
};

export function WarehouseSidebarContent({ onNavigate, onRequestCollapse }: WarehouseSidebarContentProps) {
  const logoutMut = useWarehouseLogout();

  const handleNav = () => {
    onNavigate?.();
  };

  return (
    <>
      <Box
        borderBottom="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        pt="24px"
        pb="21px"
        px="20px"
      >
        <Flex justify="space-between" align="flex-start" gap={3}>
          <Box flex="1" minW={0}>
            <NavLink
              to="/"
              style={{ textDecoration: "none" }}
              aria-label="На головну"
              onClick={handleNav}
            >
              <Flex align="center" gap="4px" h="32px">
                <Box position="relative" boxSize="28px" flexShrink={0}>
                  <Image src={imgAdminLogomark} alt="" position="absolute" inset={0} w="full" h="full" />
                </Box>
                <Text
                  fontFamily="'Public Sans', sans-serif"
                  fontWeight="bold"
                  fontSize="28px"
                  lineHeight={1}
                  letterSpacing="-1.12px"
                  color="white"
                >
                  LvStore
                </Text>
              </Flex>
            </NavLink>
            <Text
              mt="3px"
              fontSize="11px"
              color="rgba(255,255,255,0.4)"
              lineHeight="normal"
              fontFamily="'Public Sans', sans-serif"
            >
              Кабінет складу
            </Text>
          </Box>
          {onRequestCollapse ? (
            <Box display={{ base: "none", md: "block" }} flexShrink={0} lineHeight={0}>
              <SidebarIndentToggle
                purpose="collapse"
                onClick={onRequestCollapse}
                aria-label="Згорнути бокову панель"
              />
            </Box>
          ) : null}
        </Flex>
      </Box>

      <VStack align="stretch" gap={0} py="12px" flex="1" minH={0}>
        {WAREHOUSE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            style={{ textDecoration: "none" }}
            onClick={handleNav}
          >
            {({ isActive }) => (
              <Flex
                align="center"
                gap="10px"
                pl="23px"
                pr="20px"
                py="10px"
                bg={isActive ? "rgba(255,255,255,0.12)" : "transparent"}
                borderLeftWidth="3px"
                borderLeftStyle="solid"
                borderLeftColor={isActive ? "#4a9eff" : "transparent"}
                transition="background 0.15s ease, border-color 0.15s ease"
                _hover={{
                  bg: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                }}
              >
                <Image
                  src={isActive ? imgAdminNavActive : imgAdminNavIdle}
                  alt=""
                  boxSize="20px"
                  flexShrink={0}
                />
                <Text
                  fontFamily="'Public Sans', sans-serif"
                  fontWeight={isActive ? "medium" : "normal"}
                  fontSize="14px"
                  lineHeight="1.35"
                  color={isActive ? "white" : "rgba(255,255,255,0.6)"}
                >
                  {item.label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>

      <Box px="20px" pb="20px" pt={2} flexShrink={0}>
        <Button
          w="full"
          size="sm"
          variant="outline"
          color="white"
          borderColor="rgba(255,255,255,0.45)"
          _hover={{ bg: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.6)" }}
          loading={logoutMut.isPending}
          onClick={() => {
            logoutMut.mutate();
            onNavigate?.();
          }}
        >
          Вийти
        </Button>
      </Box>
    </>
  );
}

export type WarehouseSidebarProps = {
  collapsed?: boolean;
  onRequestCollapse?: () => void;
};

export function WarehouseSidebar({ collapsed = false, onRequestCollapse }: WarehouseSidebarProps) {
  const t = useAdminThemeTokens();

  return (
    <Box
      as="aside"
      w={{ md: collapsed ? "0px" : sidebarW }}
      minW={{ md: collapsed ? 0 : undefined }}
      minH="100vh"
      flexShrink={0}
      bg={t.sidebarBg}
      display={{ base: "none", md: "flex" }}
      flexDirection="column"
      overflow="hidden"
      pointerEvents={{ md: collapsed ? "none" : "auto" }}
      transition="width 0.22s ease, min-width 0.22s ease"
    >
      <WarehouseSidebarContent onRequestCollapse={onRequestCollapse} />
    </Box>
  );
}
