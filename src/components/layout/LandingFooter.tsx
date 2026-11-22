import { BrandLogo } from "./BrandLogo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border-hairline bg-surface py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="flex flex-col gap-1.5">
          <BrandLogo href="/" size="sm" />
          <p className="text-sm text-ink-secondary">
            Mendukung SDG 3 Target 3.4: Smart Lifestyle & Digital Wellbeing bagi
            pekerja di Indonesia.
          </p>
        </div>

        <span className="font-mono text-xs text-ink-muted">
          Web Application Techcomfest 2027
        </span>
      </div>
    </footer>
  );
}
