import {
  Building2,
  Calculator,
  FileSearch,
  FileText,
  LayoutDashboard,
  Share2,
  Sunrise,
} from "lucide-react";
import type { AppNavIconKind } from "./nav-items";

export function AppNavIcon({
  kind,
  className = "h-[18px] w-[18px] shrink-0",
}: {
  kind: AppNavIconKind;
  className?: string;
}) {
  switch (kind) {
    case "organization":
      return <Building2 className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "dashboard":
      return <LayoutDashboard className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "digest":
      return <Sunrise className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "audit":
      return <FileSearch className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "charter":
      return <FileText className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "simulator":
      return <Calculator className={className} strokeWidth={1.5} aria-hidden="true" />;
    case "status":
      return <Share2 className={className} strokeWidth={1.5} aria-hidden="true" />;
  }
}
