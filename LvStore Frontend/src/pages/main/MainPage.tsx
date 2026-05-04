import { Box } from "@chakra-ui/react";
import { MainAboutSection } from "./components/MainAboutSection";
import { MainContactSection } from "./components/MainContactSection";
import { MainCtaSection } from "./components/MainCtaSection";
import { MainFeaturesSection } from "./components/MainFeaturesSection";
import { MainFooterSection } from "./components/MainFooterSection";
import { MainHeroSection } from "./components/MainHeroSection";
import { MainHowItWorksSection } from "./components/MainHowItWorksSection";
import { MainOrderStatusesSection } from "./components/MainOrderStatusesSection";
import { MainRolesSection } from "./components/MainRolesSection";
import { MainStatsBar } from "./components/MainStatsBar";
import { useMainLandingQueries } from "./useMainLandingQueries";

export function MainPage() {
  const { orderStatusCounts } = useMainLandingQueries();

  return (
    <Box
      minH="100vh"
      bg="#f5f8fd"
      overflowX="clip"
      data-node-id="119:2"
      data-figma-node="119-2"
    >
      <MainHeroSection />
      <MainStatsBar />
      <MainAboutSection />
      <MainFeaturesSection />
      <MainRolesSection />
      <MainOrderStatusesSection orderStatusCounts={orderStatusCounts} />
      <MainHowItWorksSection />
      <MainCtaSection />
      <MainContactSection />
      <MainFooterSection />
    </Box>
  );
}
