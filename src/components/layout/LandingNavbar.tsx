import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "./BrandLogo";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border-hairline bg-surface">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            prefetch={false}
            className={buttonVariants({
              variant: "ghost",
              className: "min-h-[40px] px-3.5 text-ink-secondary hover:text-ink-primary",
            })}
          >
            Masuk
          </Link>
          <Link
            href="/audit?demo=true"
            className={buttonVariants({
              className: "min-h-[40px] px-4",
            })}
          >
            Coba Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
