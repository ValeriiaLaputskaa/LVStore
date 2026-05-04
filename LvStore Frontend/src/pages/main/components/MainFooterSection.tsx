import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { imgLogomark } from "../../../assets/figmaAssets";
import { footerNavItems } from "../../../components/layout/navConfig";
import { useActiveSectionHash } from "../../../components/layout/useActiveSectionHash";
import { useSectionNavigation } from "../../../components/layout/useSectionNavigation";

export function MainFooterSection() {
  const goToSection = useSectionNavigation();
  const activeHash = useActiveSectionHash();

  return (
    <Box as="footer" bg="#0d1b2e" py="48px" px={{ base: 6, md: "150px" }}>
      <Box maxW="1140px" mx="auto">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "flex-start" }}
          gap={10}
          mb="36px"
        >
          <Box maxW="240px">
            <NavLink to="/" style={{ textDecoration: "none" }}>
              <Flex align="center" gap="4px" h="32px" mb="11px">
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
            <Text fontSize="14px" color="#5a7090" lineHeight="23.1px">
              Інноваційна система управління для
              <br />
              вашої мережі магазинів та складів.
            </Text>
          </Box>

          <VStack align="flex-start" gap="12px" pt="4px">
            <Text
              fontWeight="bold"
              fontSize="12px"
              color="#8a9ab0"
              letterSpacing="1px"
              textTransform="uppercase"
              lineHeight="19.2px"
            >
              Навігація
            </Text>
            {footerNavItems.map((item) => {
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
                    fontSize="14px"
                    lineHeight="22.4px"
                    color={isActive ? "#2274d4" : "#5a7090"}
                    fontWeight={isActive ? "semibold" : "normal"}
                    borderBottomWidth={isActive ? "1px" : "0"}
                    borderBottomStyle="solid"
                    borderBottomColor="#2274d4"
                    pb={isActive ? "2px" : "0"}
                    transition="color 0.15s ease"
                    _hover={{ color: "#2274d4" }}
                  >
                    {item.label}
                  </Text>
                </NavLink>
              );
            })}
          </VStack>
        </Flex>

        <Box borderTop="1px solid rgba(255,255,255,0.08)" pt="25px">
          <Text fontSize="14px" color="#3d5070" lineHeight="22.4px">
            © 2026 LvStore. Всі права захищені.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
