export type AppNavIconKind =
  | "organization"
  | "dashboard"
  | "digest"
  | "audit"
  | "charter"
  | "simulator"
  | "status";

export interface AppNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: AppNavIconKind;
  requiresAuth?: boolean;
}

export const BASE_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/workspace",
    label: "Ringkasan Tim",
    shortLabel: "Ringkasan Tim",
    icon: "dashboard",
    requiresAuth: true,
  },
  {
    href: "/workspace/digest",
    label: "Morning Digest",
    shortLabel: "Morning Digest",
    icon: "digest",
    requiresAuth: true,
  },
  {
    href: "/audit",
    label: "Audit WA Lokal",
    shortLabel: "Audit WA",
    icon: "audit",
  },
  {
    href: "/charter",
    label: "Piagam & Balasan",
    shortLabel: "Piagam",
    icon: "charter",
  },
  {
    href: "/simulator",
    label: "Simulator Biaya",
    shortLabel: "Simulator",
    icon: "simulator",
  },
];

export function getAppNavItems(isOrgOwner: boolean): AppNavItem[] {
  if (!isOrgOwner) return BASE_NAV_ITEMS;
  return [
    {
      href: "/organization",
      label: "Ringkasan Perusahaan",
      shortLabel: "Perusahaan",
      icon: "organization",
      requiresAuth: true,
    },
    ...BASE_NAV_ITEMS,
  ];
}
