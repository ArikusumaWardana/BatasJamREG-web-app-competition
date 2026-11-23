export type DemoActorRole = "OWNER" | "LEAD" | "MEMBER";

export interface DemoActorConfig {
  actor: DemoActorRole;
  shortLabel: string;
  fullName: string;
  roleTitle: string;
  defaultEmail: string;
  description: string;
}

export interface DemoRoleUserOption {
  actor: DemoActorRole;
  email: string;
  fullName: string;
  roleTitle: string;
  divisionSummary: string;
}

export const DEMO_ACTORS: DemoActorConfig[] = [
  {
    actor: "OWNER",
    shortLabel: "Owner",
    fullName: "Raka Pratama",
    roleTitle: "Demo Lead",
    defaultEmail: "demo@batasjamreg.local",
    description:
      "Akses penuh ringkasan perusahaan, seluruh divisi, dispatch Morning Digest, dan kelola piagam.",
  },
  {
    actor: "LEAD",
    shortLabel: "Team Lead",
    fullName: "Sinta Dewi",
    roleTitle: "Team Lead",
    defaultEmail: "demo-lead@batasjamreg.local",
    description:
      "Atur jam reguler divisi, tinjau kartu darurat, rangkum antrean pagi, dan moderasi tim.",
  },
  {
    actor: "MEMBER",
    shortLabel: "Anggota",
    fullName: "Nadya Putri",
    roleTitle: "Desainer Kreatif",
    defaultEmail: "demo-member@batasjamreg.local",
    description:
      "Ajukan kartu Morning Digest, audit WA lokal, isi Wellbeing Pulse, dan tandatangani piagam.",
  },
];

export const DEMO_ROLE_USERS: DemoRoleUserOption[] = [
  {
    actor: "OWNER",
    email: "demo@batasjamreg.local",
    fullName: "Raka Pratama",
    roleTitle: "Owner / Demo Lead",
    divisionSummary: "PT Nusantara Digital (Pemilik & Mode Pantau 10 Divisi)",
  },
  {
    actor: "LEAD",
    email: "demo-lead@batasjamreg.local",
    fullName: "Sinta Dewi",
    roleTitle: "Team Lead",
    divisionSummary: "Tim Kreatif Nusantara & Tim Produk & Engineering",
  },
  {
    actor: "LEAD",
    email: "dimas.wijaya@batasjamreg.local",
    fullName: "Dimas Wijaya",
    roleTitle: "Growth Lead",
    divisionSummary: "Tim Growth & Pemasaran",
  },
  {
    actor: "LEAD",
    email: "ayu.lestari@batasjamreg.local",
    fullName: "Ayu Lestari",
    roleTitle: "Client Operations Lead",
    divisionSummary: "Tim Operasional & Klien (WITA)",
  },
  {
    actor: "LEAD",
    email: "reza.pahlevi@batasjamreg.local",
    fullName: "Reza Pahlevi",
    roleTitle: "Data & Analytics Lead",
    divisionSummary: "Tim Data & Analitik",
  },
  {
    actor: "LEAD",
    email: "hendra.gunawan@batasjamreg.local",
    fullName: "Hendra Gunawan",
    roleTitle: "QA Lead",
    divisionSummary: "Tim Quality Assurance",
  },
  {
    actor: "LEAD",
    email: "bagus.santoso@batasjamreg.local",
    fullName: "Bagus Santoso",
    roleTitle: "DevOps Lead",
    divisionSummary: "Tim Infrastruktur & Cloud",
  },
  {
    actor: "LEAD",
    email: "maya.sari@batasjamreg.local",
    fullName: "Maya Sari",
    roleTitle: "Legal & Finance Lead",
    divisionSummary: "Tim Keuangan & Legal",
  },
  {
    actor: "LEAD",
    email: "larasati.dewi@batasjamreg.local",
    fullName: "Larasati Dewi",
    roleTitle: "People & Culture Lead",
    divisionSummary: "Tim People & Budaya",
  },
  {
    actor: "LEAD",
    email: "yoga.permana@batasjamreg.local",
    fullName: "Yoga Permana",
    roleTitle: "Customer Success Lead",
    divisionSummary: "Tim Customer Success (WIT)",
  },
  {
    actor: "MEMBER",
    email: "demo-member@batasjamreg.local",
    fullName: "Nadya Putri",
    roleTitle: "Desainer Kreatif",
    divisionSummary: "Tim Kreatif Nusantara & Tim Growth & Pemasaran",
  },
  {
    actor: "MEMBER",
    email: "bima.sakti@batasjamreg.local",
    fullName: "Bima Sakti",
    roleTitle: "Senior Backend Engineer",
    divisionSummary: "Engineering, Data, Infrastruktur & Operasional",
  },
  {
    actor: "MEMBER",
    email: "tari.kusuma@batasjamreg.local",
    fullName: "Tari Kusuma",
    roleTitle: "Product Manager",
    divisionSummary: "Engineering, Growth, Data & QA",
  },
  {
    actor: "MEMBER",
    email: "fajar.nugroho@batasjamreg.local",
    fullName: "Fajar Nugroho",
    roleTitle: "People Operations",
    divisionSummary: "Kreatif, Engineering, Operasional & People",
  },
  {
    actor: "MEMBER",
    email: "rendra.pratama@batasjamreg.local",
    fullName: "Rendra Pratama",
    roleTitle: "Frontend Engineer",
    divisionSummary: "Tim Produk & Engineering & QA",
  },
  {
    actor: "MEMBER",
    email: "nadia.wulandari@batasjamreg.local",
    fullName: "Nadia Wulandari",
    roleTitle: "UI/UX Designer",
    divisionSummary: "Tim Kreatif Nusantara & QA",
  },
  {
    actor: "MEMBER",
    email: "putri.maharani@batasjamreg.local",
    fullName: "Putri Maharani",
    roleTitle: "Finance & Tax Specialist",
    divisionSummary: "Tim Data & Analitik & Keuangan",
  },
  {
    actor: "MEMBER",
    email: "citra.anggraini@batasjamreg.local",
    fullName: "Citra Anggraini",
    roleTitle: "Content Strategist",
    divisionSummary: "Kreatif, People & Customer Success",
  },
];

export function getDemoActorConfig(actor: DemoActorRole): DemoActorConfig {
  return DEMO_ACTORS.find((item) => item.actor === actor) ?? DEMO_ACTORS[0];
}

export function getDemoUsersByRole(
  actor: DemoActorRole
): DemoRoleUserOption[] {
  return DEMO_ROLE_USERS.filter((item) => item.actor === actor);
}

export function findDemoUserByEmail(
  email: string
): DemoRoleUserOption | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ROLE_USERS.find((item) => item.email.toLowerCase() === normalized);
}
