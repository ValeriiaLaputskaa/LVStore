import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { mainNavItems } from "./navConfig";
import { useActiveSectionHash } from "./useActiveSectionHash";
import { useSectionNavigation } from "./useSectionNavigation";

const linkBase = {
  w: "100%",
  px: 3,
  py: 2,
  rounded: "md",
  textDecoration: "none" as const,
};

export function Sidebar() {
  const goToSection = useSectionNavigation();
  const activeHash = useActiveSectionHash();

  return (
    <Box
      as="nav"
      w="260px"
      flexShrink={0}
      borderRight="1px solid"
      borderColor="#dde6f0"
      bg="white"
      py={6}
      display={{ base: "none", md: "block" }}
    >
      <VStack align="stretch" gap={1} px={3}>
        <NavLink to="/" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <Flex
              {...linkBase}
              bg={isActive ? "#e8f0fc" : "transparent"}
              borderLeft={isActive ? "3px solid #2274d4" : "3px solid transparent"}
              transition="background 0.15s ease"
            >
              <Text fontWeight="semibold" color="#2274d4" fontSize="sm">
                Головна
              </Text>
            </Flex>
          )}
        </NavLink>

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
              <Flex
                {...linkBase}
                bg={isActive ? "#e8f0fc" : "transparent"}
                borderLeft={isActive ? "3px solid #2274d4" : "3px solid transparent"}
                transition="background 0.15s ease, border-color 0.15s ease"
                _hover={{ bg: isActive ? "#e8f0fc" : "gray.50" }}
              >
                <Text
                  fontWeight={isActive ? "semibold" : "normal"}
                  color={isActive ? "#2274d4" : "#5a6a80"}
                  fontSize="sm"
                >
                  {item.label}
                </Text>
              </Flex>
            </NavLink>
          );
        })}
      </VStack>
    </Box>
  );
}
