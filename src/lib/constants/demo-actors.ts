export type DemoActorRole = "OWNER" | "LEAD" | "MEMBER";

export interface DemoActorConfig {
  actor: DemoActorRole;
  shortLabel: string;
  fullName: string;
  roleTitle: string;
  defaultEmail: string;
  description: string;
}

export const DEMO_ACTORS: DemoActorConfig[] = [
  {
    actor: "OWNER",
    shortLabel: "Owner",
    fullName: "Raka Pratama",
    roleTitle: "Demo Lead",
    defaultEmail: "demo@batasjamreg.local",
    description:
      "Akses penuh pengaturan workspace, dispatch Morning Digest, dan kelola piagam.",
  },
  {
    actor: "LEAD",
    shortLabel: "Team Lead",
    fullName: "Sinta Dewi",
    roleTitle: "Team Lead",
    defaultEmail: "demo-lead@batasjamreg.local",
    description:
      "Atur jam reguler tim, rangkum antrean pagi, dan moderasi kartu tim.",
  },
  {
    actor: "MEMBER",
    shortLabel: "Anggota",
    fullName: "Nadya Putri",
    roleTitle: "Desainer Kreatif",
    defaultEmail: "demo-member@batasjamreg.local",
    description:
      "Ajukan kartu Morning Digest, audit WA lokal, dan tinjau piagam (pengaturan hanya lihat).",
  },
];

export function getDemoActorConfig(actor: DemoActorRole): DemoActorConfig {
  return DEMO_ACTORS.find((item) => item.actor === actor) ?? DEMO_ACTORS[0];
}
