export interface HeroPreviewMetrics {
  period_label: string;
  team_label: string;
  shadow_overtime_label: string;
  after_hours_share: string;
  peak_window: string;
  false_urgency_count: string;
  mini_heatmap: number[][];
}

export interface CrisisStatItem {
  value: string;
  title: string;
  description: string;
  source: string;
}

export interface PrivacyZoneItem {
  zone_code: "ZONE_A" | "ZONE_B";
  badge: string;
  title: string;
  summary: string;
  guarantees: string[];
}

export interface CoreModuleItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  cta_label: string;
}

export interface SdgMappingPoint {
  code: string;
  title: string;
  description: string;
}

export const HERO_PREVIEW_METRICS: HeroPreviewMetrics = {
  period_label: "Periode: 90 Hari Terakhir",
  team_label: "Simulasi Tim Kreatif Nusantara",
  shadow_overtime_label: "42,5 Jam",
  after_hours_share: "27%",
  peak_window: "Selasa, 21:00 WIB",
  false_urgency_count: "31 Pemicu",
  mini_heatmap: [
    [1, 1, 2, 1, 1, 2, 3, 2],
    [1, 2, 1, 1, 2, 3, 4, 3],
    [1, 1, 2, 1, 1, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 3, 2],
    [1, 1, 1, 1, 1, 2, 2, 1],
    [0, 1, 1, 1, 1, 1, 2, 1],
    [0, 0, 1, 0, 1, 1, 2, 1],
  ],
};

export const INDONESIA_CRISIS_STATS: CrisisStatItem[] = [
  {
    value: "Rp463 T",
    title: "Kerugian Produktivitas Nasional",
    description:
      "Kerugian ekonomi per tahun akibat gangguan kesehatan mental pekerja, dengan 88,5% berasal dari penurunan produktivitas dan presenteeism.",
    source: "Riset Ekonomi Kesehatan Kerja Indonesia",
  },
  {
    value: "43%",
    title: "Pekerja Mengalami Burnout",
    description:
      "Pekerja Indonesia melaporkan burnout berdasarkan Workplace Happiness Index Jobstreet (Februari 2026).",
    source: "Jobstreet Workplace Happiness Index, Feb 2026",
  },
  {
    value: "52%",
    title: "Kelelahan Kerja Kronis",
    description:
      "Karyawan melaporkan kelelahan kerja kronis dengan Workplace Wellbeing Score Indonesia 50,98% (di bawah rata-rata global 58,62%).",
    source: "Workplace Wellbeing Score Indonesia, 2025",
  },
  {
    value: "UU 13/2003",
    title: "Belum Ada Aturan Right to Disconnect",
    description:
      "Pasal 77 mengatur batas jam kerja normal, namun belum ada regulasi khusus yang membatasi instruksi chat kerja di luar jam reguler.",
    source: "UU No. 13 Tahun 2003 Pasal 77",
  },
];

export const PRIVACY_ZONES: PrivacyZoneItem[] = [
  {
    zone_code: "ZONE_A",
    badge: "100% Lokal (Zero-Upload)",
    title: "Zona A: Audit Chat WhatsApp di Browser",
    summary:
      "Seluruh pembacaan file ekspor .txt Android dan .zip iOS berjalan murni di Web Worker lokal pada perangkat Anda.",
    guarantees: [
      "0 byte teks percakapan atau nama pengirim dikirim ke server atau AI",
      "Perhitungan heatmap 24x7 dan deteksi urgensi semu berlangsung offline",
      "Dapat diverifikasi langsung melalui Chrome DevTools > Network Tab",
    ],
  },
  {
    zone_code: "ZONE_B",
    badge: "Kolaborasi Tim Opt-In (RLS)",
    title: "Zona B: Infrastruktur Batas Kerja Tim",
    summary:
      "Hanya data terstruktur hasil persetujuan pengguna yang disimpan di PostgreSQL Supabase dengan Row-Level Security (RLS).",
    guarantees: [
      "Snapshot statistik numerik anonim tanpa isi chat mentah (opt-in)",
      "Kartu Async Morning Digest realtime dan Piagam Jam Digital Tim",
      "Akses antar workspace terisolasi ketat berdasarkan keanggotaan",
    ],
  },
];

export const CORE_MODULES: CoreModuleItem[] = [
  {
    id: "audit",
    badge: "Modul F1 - Lokal",
    title: "Zero-Upload WA Auditor",
    description:
      "Audit total jam lembur bayangan, persentase pesan luar jam reguler, heatmap 24x7, dan frasa urgensi semu langsung dari ekspor chat.",
    href: "/audit",
    cta_label: "Buka Audit WA",
  },
  {
    id: "digest",
    badge: "Modul F2 - Realtime",
    title: "Async Morning Digest Board",
    description:
      "Tahan instruksi non-darurat yang muncul di malam hari agar dirangkum rapi dan siap dikirim pukul 08.30 WIB esok pagi.",
    href: "/workspace/digest",
    cta_label: "Lihat Digest Board",
  },
  {
    id: "charter",
    badge: "Modul F3 - PDF & Balasan",
    title: "Piagam Tim & Balasan Diplomatis",
    description:
      "Terbitkan dokumen Piagam Jam Digital Tim (PDF lokal) dan susun balasan sopan berbasis budaya hierarkis kerja di Indonesia.",
    href: "/charter",
    cta_label: "Buat Piagam & Balasan",
  },
  {
    id: "simulator",
    badge: "Modul F4 - Advokasi HR",
    title: "Simulator Biaya Presenteeism",
    description:
      "Konversi jam lembur bayangan menjadi estimasi kerugian finansial dan hari kerja efektif hilang sebagai bahan advokasi ke manajemen.",
    href: "/simulator",
    cta_label: "Hitung Dampak Biaya",
  },
];

export const SDG_MAPPING_POINTS: SdgMappingPoint[] = [
  {
    code: "SDG 3.4",
    title: "Kesehatan Mental & Kesejahteraan Pekerja",
    description:
      "Mengurangi pemicu stres kronis dan burnout akibat budaya always-on dengan membangun batas jam digital yang terukur.",
  },
  {
    code: "Prevensi Dini",
    title: "Intervensi Sebelum Kelelahan Terjadi",
    description:
      "Memberikan indikator objektif berbasis pola waktu chat sebelum pekerja mengalami penurunan performa atau turnover.",
  },
  {
    code: "Akses Terbuka",
    title: "Terjangkau bagi Tim Lokal & UKM",
    description:
      "Menggantikan hambatan migrasi ke platform komunikasi berbayar dengan alur kerja asinkron ringan mendampingi WhatsApp.",
  },
];
