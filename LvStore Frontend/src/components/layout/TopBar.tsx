import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { imgLogomark } from "../../assets/figmaAssets";
import { mainNavItems } from "./navConfig";
import { useActiveSectionHash } from "./useActiveSectionHash";
import { useSectionNavigation } from "./useSectionNavigation";

export function TopBar() {
  const goToSection = useSectionNavigation();
  const activeHash = useActiveSectionHash();

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={50}
      h="64px"
      borderBottom="1px solid"
      borderColor="#dde6f0"
      bg="white"
      px={{ base: 4, md: "48px" }}
    >
      <Flex h="full" align="center" justify="space-between" maxW="1440px" mx="auto">
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="4px" h="32px">
            <Image src={imgLogomark} alt="" boxSize="28px" />
            <Text
              fontFamily="'Public Sans', sans-serif"
              fontWeight="bold"
              fontSize="28px"
              letterSpacing="-1.12px"
              lineHeight={1}
              color="#2274d4"
            >
              LvStore
            </Text>
          </Flex>
        </NavLink>

        <Flex
          gap={{ base: 4, lg: "32px" }}
          display={{ base: "none", lg: "flex" }}
          align="center"
        >
          {mainNavItems.map((item) => {
            const isActive = activeHash === item.hash;
            return (
              <NavLink
                key={item.hash}
                to={{ pathname: "/", hash: item.hash }}
                onClick={(e) => {
                  e.preventDefault();
                  goToSection(item.hash);
                }}
                style={{ textDecoration: "none" }}
              >
                <Text
                  as="span"
                  fontFamily="'Public Sans', sans-serif"
                  fontWeight={isActive ? "bold" : "medium"}
                  fontSize="16px"
                  lineHeight="25.6px"
                  color={isActive ? "#2274d4" : "#5a6a80"}
                  position="relative"
                  pb="4px"
                  borderBottomWidth={isActive ? "2px" : "0"}
                  borderBottomStyle="solid"
                  borderBottomColor="#2274d4"
                  transition="color 0.15s ease, border-color 0.15s ease"
                  _hover={{
                    color: "#2274d4",
                  }}
                >
                  {item.label}
                </Text>
              </NavLink>
            );
          })}
        </Flex>

        <Button
          asChild
          bg="#2274d4"
          border="2px solid"
          borderColor="#2274d4"
          color="white"
          rounded="10px"
          px="26px"
          py="12px"
          h="auto"
          fontFamily="'Public Sans', sans-serif"
          fontWeight="bold"
          fontSize="16px"
          lineHeight="25.6px"
          _hover={{ bg: "#1a5fb0" }}
        >
          <NavLink to="/login" style={{ textDecoration: "none", color: "inherit" }}>
            Увійти
          </NavLink>
        </Button>
      </Flex>
    </Box>
  );
}
