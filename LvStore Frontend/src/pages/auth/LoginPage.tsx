import {
  Box,
  Button,
  Field,
  Flex,
  Image,
  Input,
  Text,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useId, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { imgAuthCheckEmpty, imgAuthDivider, imgAuthGoogle, imgAuthLogomark } from "../../assets/figmaAuthAssets";
import { getCurrentUser, getGoogleOAuthAuthorizationUrl, login } from "../../api/authApi";
import { getLoginErrorMessage } from "./loginError";
import { getPostLoginPath } from "./useLoginMutation";
import { LvStoreLoginSpinner } from "./LvStoreLoginSpinner";

const pageBg = "#fafcff";
const inputBg = "rgba(37, 82, 126, 0.09)";
const headerText = "#1b2128";
const placeholderColor = "rgba(20, 33, 46, 0.4)";
const checkboxLabel = "rgba(20, 33, 46, 0.62)";
const btnBg = "#1e90ff";
const btnLabel = "#000305";
const logoBlue = "#2274d4";
const googleBtnBg = "#fafcff";
const googleBtnBorder = "rgba(73, 92, 110, 0.2)";
const dividerLine = "rgba(20, 33, 46, 0.14)";
const orContinueColor = "rgba(20, 33, 46, 0.62)";

const inputShell = {
  bg: inputBg,
  borderWidth: "1.5px",
  borderColor: "transparent",
  rounded: "16px",
  px: "12px",
  py: "8px",
  minH: "36px",
  w: "full",
  fontFamily: "'Outfit', 'Noto Sans', 'Public Sans', sans-serif",
  fontSize: "15px",
  fontWeight: "normal",
  lineHeight: "20px",
  color: headerText,
  _placeholder: { color: placeholderColor },
  _focusVisible: {
    outline: "none",
    borderColor: "rgba(34, 116, 212, 0.55)",
    boxShadow: "0 0 0 1px rgba(34, 116, 212, 0.25)",
  },
};

function CheckFilled16() {
  return (
    <Box
      boxSize="16px"
      rounded="4px"
      bg={logoBlue}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      aria-hidden
    >
      <svg width="10" height="8" viewBox="0 0 12 10" fill="none" aria-hidden>
        <path
          d="M1 5l3 3 7-7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

function randomLoginUiDelayMs(): number {
  return 5000 + Math.floor(Math.random() * 2001);
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const loading = loginBusy;

  useEffect(() => {
    const oauth = searchParams.get("oauth2");
    const oauthError = searchParams.get("error");
    if (oauth === "access_denied" || oauthError != null) {
      setFormError(
        "Вхід через Google неможливий: обліковий запис з цим email не знайдено в системі, email не підтверджено в Google або вхід скасовано. Зверніться до адміністратора.",
      );
    }
  }, [searchParams]);

  const validate = (): boolean => {
    let ok = true;
    if (!email.trim()) {
      setEmailError("Вкажіть email");
      ok = false;
    } else {
      setEmailError(null);
    }
    if (!password) {
      setPasswordError("Вкажіть пароль");
      ok = false;
    } else {
      setPasswordError(null);
    }
    if (!termsAccepted) {
      setTermsError("Потрібно погодитися з умовами використання.");
      ok = false;
    } else {
      setTermsError(null);
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) {
      return;
    }
    const minUiMs = randomLoginUiDelayMs();
    const started = Date.now();
    setLoginBusy(true);
    try {
      await login({ email: email.trim(), password });
      const user = await getCurrentUser();
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, minUiMs - elapsed);
      if (remaining > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, remaining));
      }
      navigate(getPostLoginPath(user.role), { replace: true });
    } catch (err) {
      setFormError(getLoginErrorMessage(err));
    } finally {
      setLoginBusy(false);
    }
  };

  const handleGoogleLogin = () => {
    setFormError(null);
    if (!termsAccepted) {
      setTermsError("Потрібно погодитися з умовами використання.");
      return;
    }
    window.location.assign(getGoogleOAuthAuthorizationUrl());
  };

  const pagePadX = { base: "16px", md: "48px" };
  const dividerBleed = { base: "-16px", md: "-48px" };

  return (
    <Box
      minH="100vh"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      isolation="isolate"
      overflowY="hidden"
      position="relative"
      data-figma-node="121-2"
      data-name="User Auth"
    >
      {loginBusy ? (
        <Box
          position="fixed"
          inset={0}
          zIndex={100}
          bg="rgba(15, 23, 42, 0.48)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          aria-busy="true"
          aria-live="polite"
        >
          <Box textAlign="center">
            <LvStoreLoginSpinner />
            <Text
              mt={4}
              fontSize="sm"
              fontWeight="medium"
              color="white"
              fontFamily="'Outfit', 'Noto Sans', sans-serif"
              textShadow="0 1px 2px rgba(0,0,0,0.35)"
            >
              Завантаження…
            </Text>
          </Box>
        </Box>
      ) : null}
      {/* Basic Header — 121:3 */}
      <Box px={pagePadX} flexShrink={0} position="relative" zIndex={3} bg={pageBg}>
        <Box position="relative" py="18px" w="full">
          <Flex align="center" h="32px" data-node-id="121:4">
            <NavLink
              to="/"
              aria-label="На головну"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Flex align="center" gap="4px" h="32px">
                <Box position="relative" boxSize="28px" flexShrink={0} data-node-id="121:6">
                  <Image
                    src={imgAuthLogomark}
                    alt=""
                    position="absolute"
                    inset={0}
                    w="full"
                    h="full"
                    objectFit="contain"
                  />
                </Box>
                <Text
                  as="span"
                  fontFamily="'Sen', 'Public Sans', sans-serif"
                  fontWeight="bold"
                  fontSize="28px"
                  lineHeight={1}
                  letterSpacing="-1.12px"
                  color={logoBlue}
                  whiteSpace="nowrap"
                  data-node-id="121:8"
                >
                  LvStore
                </Text>
              </Flex>
            </NavLink>
          </Flex>
          <Box
            position="absolute"
            bottom="0"
            left={dividerBleed}
            right={dividerBleed}
            h="1px"
            overflow="visible"
            pointerEvents="none"
            data-node-id="121:9"
          >
            <Image
              src={imgAuthDivider}
              alt=""
              display="block"
              w="full"
              h="auto"
              maxH="4px"
              objectFit="cover"
            />
          </Box>
        </Box>
      </Box>

      {/* Container — 121:10 */}
      <Box flex="1" py="48px" w="full" position="relative" zIndex={2} minH={0}>
        <Box
          bg={pageBg}
          display="flex"
          flexDirection="column"
          alignItems="center"
          w="full"
          minH={{ base: "520px", md: "700px" }}
          pt={{ base: "64px", md: "200px" }}
          data-node-id="121:12"
        >
          {/* Container — 121:13, w 400px, gap 36px */}
          <VStack
            align="stretch"
            gap="36px"
            w={{ base: "full", sm: "400px" }}
            maxW="400px"
            px={{ base: 4, sm: 0 }}
            data-figma-node="193-13"
          >
            {/* Header — 121:14, gap 8px */}
            <VStack align="stretch" gap="8px" textAlign="center" color={headerText} w="full">
              <Text
                as="h1"
                fontFamily="'Outfit', 'Noto Sans', sans-serif"
                fontWeight="semibold"
                fontSize="28px"
                lineHeight="32px"
                w="full"
                data-node-id="121:15"
              >
                Вхід
              </Text>
              <Text
                fontFamily="'Outfit', 'Noto Sans', sans-serif"
                fontWeight="normal"
                fontSize="15px"
                lineHeight="20px"
                w="full"
                data-node-id="193:16"
              >
                Введіть ваші дані для входу до облікового запису.
              </Text>
            </VStack>

            <Box as="form" w="full" onSubmit={handleSubmit}>
              <VStack align="stretch" gap="18px" data-node-id="121:17">
                {formError ? (
                  <Box
                    role="alert"
                    data-testid="login-form-error"
                    rounded="16px"
                    px={3}
                    py={2}
                    bg="rgba(220, 53, 69, 0.08)"
                    border="1.5px solid rgba(220, 53, 69, 0.25)"
                  >
                    <Text fontSize="13px" lineHeight="16px" color="#a32035">
                      {formError}
                    </Text>
                  </Box>
                ) : null}

                <Field.Root invalid={Boolean(emailError)}>
                  <VisuallyHidden>
                    <label htmlFor={emailId}>Email адреса</label>
                  </VisuallyHidden>
                  <Input
                    id={emailId}
                    data-testid="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email "
                    value={email}
                    disabled={loading}
                    onChange={(ev) => {
                      setEmail(ev.target.value);
                      setEmailError(null);
                      setFormError(null);
                    }}
                    {...inputShell}
                    data-node-id="121:18"
                  />
                  {emailError ? <Field.ErrorText mt={1}>{emailError}</Field.ErrorText> : null}
                </Field.Root>

                <Field.Root invalid={Boolean(passwordError)}>
                  <VisuallyHidden>
                    <label htmlFor={passwordId}>Пароль</label>
                  </VisuallyHidden>
                  <Input
                    id={passwordId}
                    data-testid="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    disabled={loading}
                    onChange={(ev) => {
                      setPassword(ev.target.value);
                      setPasswordError(null);
                      setFormError(null);
                    }}
                    {...inputShell}
                    data-node-id="124:2"
                  />
                  {passwordError ? <Field.ErrorText mt={1}>{passwordError}</Field.ErrorText> : null}
                </Field.Root>

                <Button
                  data-testid="login-submit"
                  type="submit"
                  w="full"
                  rounded="16px"
                  bg={btnBg}
                  px="18px"
                  py="8px"
                  minH="36px"
                  h="auto"
                  disabled={loading}
                  fontFamily="'Outfit', 'Noto Sans', sans-serif"
                  fontWeight="medium"
                  fontSize="15px"
                  lineHeight="20px"
                  color={btnLabel}
                  whiteSpace="nowrap"
                  _hover={{ bg: loading ? btnBg : "#1a82e8" }}
                  _disabled={{ opacity: 0.65, cursor: "not-allowed" }}
                  data-node-id="121:22"
                >
                  {loading ? "Вхід…" : "Увійти"}
                </Button>
              </VStack>
            </Box>

            {/* Divider + Google — 193:24 … 193:34 */}
            <Flex align="center" gap="8px" w="full" data-node-id="193:24">
              <Box flex="1" minW={0} h="1px" bg={dividerLine} aria-hidden />
              <Text
                fontFamily="'Outfit', 'Public Sans', sans-serif"
                fontWeight="normal"
                fontSize="13px"
                lineHeight="16px"
                color={orContinueColor}
                whiteSpace="nowrap"
                flexShrink={0}
                data-node-id="193:26"
              >
                or continue with
              </Text>
              <Box flex="1" minW={0} h="1px" bg={dividerLine} aria-hidden />
            </Flex>

            <Button
              type="button"
              w="full"
              rounded="16px"
              bg={googleBtnBg}
              borderWidth="1.5px"
              borderColor={googleBtnBorder}
              p="8px"
              minH="36px"
              h="auto"
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={handleGoogleLogin}
              disabled={loading}
              data-testid="login-google"
              data-node-id="193:28"
              _hover={{ bg: loading ? googleBtnBg : "#f0f6fc" }}
              _disabled={{ opacity: 0.65, cursor: "not-allowed" }}
            >
              <Box position="absolute" left="8px" top="50%" transform="translateY(-50%)" boxSize="20px" flexShrink={0} data-node-id="193:29">
                <Image src={imgAuthGoogle} alt="" w="full" h="full" objectFit="contain" />
              </Box>
              <Text
                fontFamily="'Outfit', 'Public Sans', sans-serif"
                fontWeight="medium"
                fontSize="15px"
                lineHeight="20px"
                color={headerText}
                data-node-id="193:34"
              >
                Google
              </Text>
            </Button>

            {/* checkboxSmall — 121:35 / 193:35 */}
            <button
              type="button"
              onClick={() => {
                setTermsAccepted((v) => !v);
                setTermsError(null);
                setFormError(null);
              }}
              data-node-id="121:35"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                alignSelf: "center",
                margin: 0,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <Box position="relative" boxSize="16px" flexShrink={0} data-node-id="121:36">
                {termsAccepted ? (
                  <CheckFilled16 />
                ) : (
                  <Image
                    src={imgAuthCheckEmpty}
                    alt=""
                    position="absolute"
                    inset={0}
                    w="full"
                    h="full"
                    objectFit="contain"
                  />
                )}
              </Box>
              <Text
                as="span"
                fontFamily="'Outfit', 'Noto Sans', sans-serif"
                fontWeight="normal"
                fontSize="13px"
                lineHeight="16px"
                color={checkboxLabel}
                whiteSpace="nowrap"
                data-node-id="121:38"
              >
                Погоджуюсь з умовами використання
              </Text>
            </button>
            {termsError ? (
              <Text color="#a32035" fontSize="13px" lineHeight="16px" textAlign="center">
                {termsError}
              </Text>
            ) : null}
          </VStack>
        </Box>
      </Box>

      {/* Basic Footer — 121:39 */}
      <Box h="48px" w="full" flexShrink={0} bg={pageBg} zIndex={1} data-node-id="121:39" />
    </Box>
  );
}
