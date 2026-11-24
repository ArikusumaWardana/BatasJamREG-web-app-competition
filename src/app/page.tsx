import { FeaturesSection } from "@/features/landing/components/FeaturesSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { LandingFooterCta } from "@/features/landing/components/LandingFooterCta";
import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import { PrivacyArchitectureSection } from "@/features/landing/components/PrivacyArchitectureSection";
import { RoleImpactSection } from "@/features/landing/components/RoleImpactSection";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-surface text-ink-primary">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PrivacyArchitectureSection />
        <RoleImpactSection />
      </main>
      <LandingFooterCta />
    </div>
  );
}
