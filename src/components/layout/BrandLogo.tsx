import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md";
}

export function BrandLogo({ href = "/", size = "md" }: BrandLogoProps) {
  const iconSize = size === "sm" ? 22 : 24;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="1.5"
          y="1.5"
          width="23"
          height="23"
          rx="5"
          fill="#EDF4F5"
          stroke="#1E4E56"
          strokeWidth="1.5"
        />
        <path
          d="M13 6.5V13L17.5 15.5"
          stroke="#1E4E56"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="13" r="1.25" fill="#1C1917" />
      </svg>
      <span className="text-[16px] font-semibold tracking-tight text-ink-primary">
        BatasJamREG
      </span>
    </Link>
  );
}
