import { SiteHeader } from "@/components/layout/SiteHeader";
import { AboutSection } from "@/features/landing/components/AboutSection";
import { AccessSection } from "@/features/landing/components/AccessSection";
import { DownloadSection } from "@/features/landing/components/DownloadSection";
import { FeaturesSection } from "@/features/landing/components/FeaturesSection";
import { Hero } from "@/features/landing/components/Hero";

// Лендинг (Figma: Mobile-app-UI, кадр 1313:2343). Шапка светлая и лежит поверх фото hero.
export default function LandingPage() {
  return (
    <>
      <SiteHeader tone="light" />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <AboutSection />
        <FeaturesSection />
        <DownloadSection />
        <AccessSection />
      </main>
    </>
  );
}
