import { Box, Button, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { imgSvg11, imgSvg12, imgSvg13 } from "../../../assets/figmaAssets";

export function MainContactSection() {
  return (
    <Box id="contacts" bg="white" py="60px" px={{ base: 6, md: "150px" }} scrollMarginTop="80px">
      <Box maxW="1140px" mx="auto" px={{ base: 0, md: "48px" }}>
        <Flex direction="column" gap="9px" align="center" mb="56px">
          <Text
            fontWeight="bold"
            fontSize="12px"
            color="#2274d4"
            letterSpacing="1.5px"
            textTransform="uppercase"
            textAlign="center"
            lineHeight="19.2px"
          >
            Контакти
          </Text>
          <Text
            fontWeight="bold"
            fontSize={{ base: "28px", md: "36px" }}
            color="#0d1b2e"
            letterSpacing="-0.5px"
            textAlign="center"
            lineHeight={{ base: "34px", md: "41.4px" }}
          >
            Ми на зв&apos;язку
          </Text>
          <Box maxW="520px" pt="3px" textAlign="center">
            <Text fontSize="16px" color="#5a6a80" lineHeight="27.2px">
              Є питання, хочете демо або просто хочете дізнатись більше —
              <br />
              напишіть нам. Відповідаємо швидко.
            </Text>
          </Box>
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", lg: "minmax(0,1fr) minmax(0,1.4fr)" }}
          gap="48px"
        >
          <Flex direction="column" gap="16px">
            <Box bg="#f5f8fd" border="1px solid #dde6f0" rounded="18px" p="33px">
              <Flex gap="16px" align="flex-start">
                <Flex bg="#e8f0fc" rounded="10px" boxSize="44px" align="center" justify="center">
                  <Image src={imgSvg11} alt="" boxSize="20px" />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="#8a9ab0" letterSpacing="0.5px" textTransform="uppercase">
                    Телефон
                  </Text>
                  <Text fontWeight="semibold" fontSize="16px" color="#0d1b2e" lineHeight="25.6px" mt="4px">
                    +38 (050) 000-00-00
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box bg="#f5f8fd" border="1px solid #dde6f0" rounded="18px" p="33px">
              <Flex gap="16px" align="flex-start">
                <Flex bg="#e8f0fc" rounded="10px" boxSize="44px" align="center" justify="center">
                  <Image src={imgSvg12} alt="" boxSize="20px" />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="#8a9ab0" letterSpacing="0.5px" textTransform="uppercase">
                    Email
                  </Text>
                  <Text fontWeight="semibold" fontSize="16px" color="#0d1b2e" lineHeight="25.6px" mt="4px">
                    info@lvstore.ua
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box bg="#f5f8fd" border="1px solid #dde6f0" rounded="18px" p="33px">
              <Flex gap="16px" align="flex-start">
                <Flex bg="#e8f0fc" rounded="10px" boxSize="44px" align="center" justify="center">
                  <Image src={imgSvg13} alt="" boxSize="20px" />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="#8a9ab0" letterSpacing="0.5px" textTransform="uppercase">
                    Адреса
                  </Text>
                  <Text fontWeight="bold" fontSize="16px" color="#0d1b2e" lineHeight="25.6px" mt="4px">
                    м. Київ, Україна
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Flex>

          <Box border="1px solid #dde6f0" rounded="20px" p="41px">
            <Text fontWeight="bold" fontSize="24px" color="#0d1b2e" lineHeight="38.4px">
              Напишіть нам
            </Text>
            <Text fontSize="16px" color="#5a6a80" lineHeight="25.6px" mt="6px">
              Розкажіть про вашу мережу — відповімо протягом дня.
            </Text>

            <Box pt="26px">
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="16px" mb="20px">
                <Box>
                  <Text fontWeight="bold" fontSize="14px" color="#0d1b2e" lineHeight="22.4px" mb="6px">
                    Ваше ім&apos;я
                  </Text>
                  <input
                    readOnly
                    defaultValue="Іван Петренко"
                    style={{
                      width: "100%",
                      background: "#f5f8fd",
                      border: "1px solid #dde6f0",
                      borderRadius: "10px",
                      padding: "13px 17px",
                      color: "#757575",
                      fontSize: 16,
                    }}
                  />
                </Box>
                <Box>
                  <Text fontWeight="semibold" fontSize="14px" color="#0d1b2e" lineHeight="22.4px" mb="6px">
                    Email
                  </Text>
                  <input
                    readOnly
                    defaultValue="ivan@company.ua"
                    style={{
                      width: "100%",
                      background: "#f5f8fd",
                      border: "1px solid #dde6f0",
                      borderRadius: "10px",
                      padding: "13px 17px",
                      color: "#757575",
                      fontSize: 16,
                    }}
                  />
                </Box>
              </Grid>

              <Box mb="20px">
                <Flex align="baseline" gap="1px" mb="6px">
                  <Text fontWeight="bold" fontSize="14px" color="#0d1b2e" lineHeight="22.4px">
                    Телефон{" "}
                  </Text>
                  <Text fontSize="13px" color="#8a9ab0" lineHeight="20.8px">
                    (необов&apos;язково)
                  </Text>
                </Flex>
                <input
                  readOnly
                  defaultValue="+38 (0XX) XXX-XX-XX"
                  style={{
                    width: "100%",
                    background: "#f5f8fd",
                    border: "1px solid #dde6f0",
                    borderRadius: "10px",
                    padding: "13px 17px",
                    color: "#757575",
                    fontSize: 16,
                  }}
                />
              </Box>

              <Box mb="20px">
                <Text fontWeight="bold" fontSize="14px" color="#0d1b2e" lineHeight="22.4px" mb="6px">
                  Повідомлення
                </Text>
                <textarea
                  readOnly
                  defaultValue="Розкажіть про вашу мережу або поставте питання"
                  style={{
                    width: "100%",
                    minHeight: 120,
                    background: "#f5f8fd",
                    border: "1px solid #dde6f0",
                    borderRadius: "10px",
                    padding: "13px 17px",
                    color: "#757575",
                    fontSize: 16,
                    resize: "none",
                  }}
                />
              </Box>

              <Flex direction="column" gap="11px">
                <Button
                  bg="#2274d4"
                  border="2px solid #2274d4"
                  color="white"
                  rounded="12px"
                  w="100%"
                  py="16px"
                  h="auto"
                  fontWeight="bold"
                  fontSize="16px"
                  lineHeight="25.6px"
                  _hover={{ bg: "#1a5fb0" }}
                >
                  Надіслати повідомлення
                </Button>
                <Text fontSize="13px" color="#8a9ab0" textAlign="center" lineHeight="20.8px">
                  Ми не передаємо ваші дані третім особам
                </Text>
              </Flex>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
