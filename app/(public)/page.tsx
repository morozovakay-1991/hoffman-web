import { SiteHeader } from "@/components/layout/SiteHeader";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { AccessSection } from "@/features/landing/components/AccessSection";
import { DOWNLOAD_SECTION_ID, DownloadSection } from "@/features/landing/components/DownloadSection";
import { FeaturesSection } from "@/features/landing/components/FeaturesSection";
import { Hero } from "@/features/landing/components/Hero";
import { PricingSection } from "@/features/landing/components/PricingSection";

// Лендинг (Figma: Mobile-app-UI, кадр 1313:2343). Шапка светлая и лежит поверх фото hero.
export default function LandingPage() {
  return (
    <>
      <SiteHeader tone="light" downloadHref={`#${DOWNLOAD_SECTION_ID}`} />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <FeaturesSection />
        <DownloadSection />
        <AccessSection />
        <PricingSection />
      </main>
    </>
  );
}
