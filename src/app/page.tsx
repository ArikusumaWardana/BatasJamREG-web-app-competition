import { LandingFooter } from "@/components/layout/LandingFooter";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingCrisisSection } from "@/features/landing/components/LandingCrisisSection";
import { LandingFirewallSection } from "@/features/landing/components/LandingFirewallSection";
import { LandingHeroSection } from "@/features/landing/components/LandingHeroSection";
import { LandingModulesSection } from "@/features/landing/components/LandingModulesSection";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink-primary">
      <LandingNavbar />
      <main id="top" className="flex-1">
        <LandingHeroSection />
        <LandingCrisisSection />
        <LandingFirewallSection />
        <LandingModulesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
