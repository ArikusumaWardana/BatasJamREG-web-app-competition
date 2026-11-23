import type { jsPDF } from "jspdf";

export interface LoadedStampImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_CANVAS_SIDE = 512;
const STAMP_LOAD_TIMEOUT_MS = 5000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function loadImageToPngDataUrl(
  src: string,
  useCors: boolean,
  targetSize?: number
): Promise<LoadedStampImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (useCors) {
      img.crossOrigin = "anonymous";
    }
    let settled = false;

    const finish = (result: LoadedStampImage | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timerId);
      resolve(result);
    };

    const timerId = window.setTimeout(() => finish(null), STAMP_LOAD_TIMEOUT_MS);

    img.onload = () => {
      try {
        const naturalWidth = targetSize ?? (img.naturalWidth || img.width);
        const naturalHeight = targetSize ?? (img.naturalHeight || img.height);
        if (!naturalWidth || !naturalHeight) {
          finish(null);
          return;
        }
        const scale = Math.min(
          1,
          MAX_CANVAS_SIDE / Math.max(naturalWidth, naturalHeight)
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        finish({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        finish(null);
      }
    };

    img.onerror = () => finish(null);
    img.src = src;
  });
}

export function loadStampImageDataUrl(
  url?: string | null
): Promise<LoadedStampImage | null> {
  if (!url || typeof window === "undefined") {
    return Promise.resolve(null);
  }
  return loadImageToPngDataUrl(url, true);
}

export async function renderDefaultStampDataUrl(
  organizationName: string
): Promise<LoadedStampImage | null> {
  if (typeof window === "undefined" || typeof Blob === "undefined") {
    return null;
  }

  const cleanName = (organizationName.trim() || "BATASJAMREG")
    .replace(/\u2014/g, "-")
    .toUpperCase()
    .slice(0, 28);
  const ringText = escapeXml(`${cleanName} * TERVERIFIKASI DIGITAL * `);
  const fontSize = cleanName.length > 22 ? "5.8" : "6.4";
  const letterSpacing = cleanName.length > 22 ? "0.7" : "0.95";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="360" height="360">
    <defs>
      <path id="pdf-stamp-arc" d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
    </defs>
    <g transform="rotate(-6 60 60)" font-family="Helvetica, Arial, sans-serif">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#2E6F56" stroke-width="2.2" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#2E6F56" stroke-width="0.9" stroke-dasharray="2.5 2" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="#2E6F56" stroke-width="1.2" />
      <text fill="#2E6F56" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}">
        <textPath href="#pdf-stamp-arc" startOffset="0%">${ringText}</textPath>
      </text>
      <line x1="28" y1="52" x2="92" y2="52" stroke="#2E6F56" stroke-width="0.9" />
      <text x="60" y="63" text-anchor="middle" fill="#2E6F56" font-size="9.5" font-weight="800" letter-spacing="1.6">RESMI</text>
      <line x1="28" y1="68" x2="92" y2="68" stroke="#2E6F56" stroke-width="0.9" />
      <text x="60" y="78" text-anchor="middle" fill="#2E6F56" font-size="5.8" font-weight="700" letter-spacing="0.8">BATASJAMREG</text>
    </g>
  </svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImageToPngDataUrl(objectUrl, false, 360);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function drawPdfVectorCircularStamp(
  doc: jsPDF,
  centerX: number,
  centerY: number,
  radius: number,
  organizationName: string
): void {
  const cleanOrg = (organizationName.trim() || "BATASJAMREG")
    .replace(/\u2014/g, "-")
    .toUpperCase()
    .slice(0, 28);

  doc.setDrawColor(46, 111, 86);
  doc.setLineWidth(0.5);
  doc.circle(centerX, centerY, radius, "S");

  doc.setLineWidth(0.2);
  doc.circle(centerX, centerY, radius * 0.88, "S");

  doc.setTextColor(46, 111, 86);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(3.9);
  doc.text("TERVERIFIKASI", centerX, centerY - radius * 0.44, {
    align: "center",
  });

  doc.setLineWidth(0.18);
  doc.line(centerX - radius * 0.56, centerY - 2.1, centerX + radius * 0.56, centerY - 2.1);
  doc.line(centerX - radius * 0.56, centerY + 1.1, centerX + radius * 0.56, centerY + 1.1);

  doc.setFontSize(4.8);
  doc.text("RESMI", centerX, centerY + 0.3, { align: "center" });

  doc.setFontSize(3.4);
  const orgLines = (doc.splitTextToSize(cleanOrg, radius * 1.32) as string[]).slice(0, 2);
  doc.text(orgLines, centerX, centerY + 3.1, { align: "center" });
}

export function drawPdfLeaderStampGraphic(
  doc: jsPDF,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number,
  organizationName: string,
  stampImage?: LoadedStampImage | null
): void {
  if (
    stampImage &&
    stampImage.dataUrl &&
    stampImage.width > 0 &&
    stampImage.height > 0
  ) {
    const scale = Math.min(
      boxWidth / stampImage.width,
      boxHeight / stampImage.height
    );
    const drawW = stampImage.width * scale;
    const drawH = stampImage.height * scale;
    const drawX = boxX + (boxWidth - drawW) / 2;
    const drawY = boxY + (boxHeight - drawH) / 2;
    doc.addImage(stampImage.dataUrl, "PNG", drawX, drawY, drawW, drawH);
    return;
  }

  const radius = Math.min(boxWidth, boxHeight) / 2 - 0.4;
  drawPdfVectorCircularStamp(
    doc,
    boxX + boxWidth / 2,
    boxY + boxHeight / 2,
    radius,
    organizationName
  );
}
