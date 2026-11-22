import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md";
}

export function BrandLogo({ href = "/", size = "md" }: BrandLogoProps) {
  const isCompact = size === "sm";
  const iconSize = isCompact ? 28 : 32;

  return (
    <Link
      href={href}
      aria-label="BatasJamREG - Beranda"
      className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-150 group-hover:scale-[1.03]"
      >
        {/* Perisai jam kerja sehat */}
        <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E4E56" />

        {/* Lingkaran penuh 24 jam (zona tenang di luar jam reguler) */}
        <circle
          cx="16"
          cy="16"
          r="7.75"
          stroke="#FFFFFF"
          strokeOpacity="0.24"
          strokeWidth="2.1"
        />

        {/* Busur jam reguler 09:00-17:00 berhenti tepat pada batas pulang */}
        <path
          d="M8.25 16A7.75 7.75 0 1 1 19.875 22.71"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Jarum jam menunjuk batas selesai kerja */}
        <path
          d="M16 11.75V16L19.1 18.2"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Titik penanda batas jam reguler */}
        <circle cx="19.875" cy="22.71" r="2" fill="#F6C992" />
      </svg>

      <span className="inline-flex items-center leading-none">
        <span
          className={
            isCompact
              ? "text-[16px] font-bold tracking-[-0.025em] text-ink-primary"
              : "text-[18px] font-bold tracking-[-0.025em] text-ink-primary"
          }
        >
          Batas
        </span>
        <span
          className={
            isCompact
              ? "text-[16px] font-semibold tracking-[-0.02em] text-brand"
              : "text-[18px] font-semibold tracking-[-0.02em] text-brand"
          }
        >
          Jam
        </span>
        <span
          className={
            isCompact
              ? "ml-1 inline-flex items-center rounded-[4px] border border-brand-border bg-brand-soft px-1.5 py-[2.5px] font-mono text-[10px] font-semibold tracking-wider text-brand"
              : "ml-1 inline-flex items-center rounded-[5px] border border-brand-border bg-brand-soft px-1.5 py-[3px] font-mono text-[11px] font-semibold tracking-wider text-brand"
          }
        >
          REG
        </span>
      </span>
    </Link>
  );
}
