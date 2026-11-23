"use client";

import { useId } from "react";

interface DigitalStampSvgProps {
  organizationName: string;
  statusLabel?: string;
  className?: string;
}

export function DigitalStampSvg({
  organizationName,
  statusLabel = "TERVERIFIKASI DIGITAL",
  className = "h-20 w-20",
}: DigitalStampSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pathId = `stamp-arc-${uid}`;
  const cleanName = (organizationName.trim() || "BATASJAMREG")
    .replace(/\u2014/g, "-")
    .toUpperCase()
    .slice(0, 28);
  const ringText = `${cleanName} * ${statusLabel.toUpperCase()} * `;

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <path
          id={pathId}
          d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0"
        />
      </defs>

      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke="#2E6F56"
        strokeWidth="2.2"
      />
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="#2E6F56"
        strokeWidth="0.9"
        strokeDasharray="2.5 2"
      />
      <circle
        cx="60"
        cy="60"
        r="34"
        fill="none"
        stroke="#2E6F56"
        strokeWidth="1.2"
      />

      <text
        fill="#2E6F56"
        fontSize="6.6"
        fontWeight="700"
        letterSpacing="1.1"
      >
        <textPath href={`#${pathId}`} startOffset="0%">
          {ringText}
        </textPath>
      </text>

      <line
        x1="28"
        y1="52"
        x2="92"
        y2="52"
        stroke="#2E6F56"
        strokeWidth="0.9"
      />
      <text
        x="60"
        y="63"
        textAnchor="middle"
        fill="#2E6F56"
        fontSize="9.5"
        fontWeight="800"
        letterSpacing="1.6"
      >
        RESMI
      </text>
      <line
        x1="28"
        y1="68"
        x2="92"
        y2="68"
        stroke="#2E6F56"
        strokeWidth="0.9"
      />
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fill="#2E6F56"
        fontSize="5.8"
        fontWeight="700"
        letterSpacing="0.8"
      >
        BATASJAMREG
      </text>
    </svg>
  );
}
