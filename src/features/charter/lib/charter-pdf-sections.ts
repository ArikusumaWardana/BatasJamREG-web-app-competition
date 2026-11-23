import type { jsPDF } from "jspdf";
import type { CharterDraft } from "../types";
import { drawCharterSignatureBlock } from "./charter-pdf-signatures";
import type { LoadedStampImage } from "./charter-pdf-stamp";
import type { ResolvedCharterSignatures } from "./charter-signatures";

const COMMITMENT_CLAUSES = [
  "1. Pesan non-darurat yang dikirim di luar jam tenang ditampung ke Async Morning Digest Board tanpa ekspektasi balasan seketika.",
  "2. Anggota tim berhak mematikan notifikasi kerja di luar jam kerja reguler tanpa penilaian negatif atas kinerja maupun dedikasi.",
  "3. Eskalasi mendesak di luar jam kerja hanya menggunakan jalur darurat jika memenuhi kriteria darurat operasional di atas.",
];

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatIndonesianDate(rawDate?: string): string {
  const date = rawDate ? new Date(rawDate) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "Berlaku saat disahkan";
  }
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()] ?? "Januari";
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function getLastTableY(doc: jsPDF, fallbackY: number): number {
  const maybeTable = Reflect.get(doc, "lastAutoTable");
  if (typeof maybeTable === "object" && maybeTable !== null) {
    const finalY = Reflect.get(maybeTable, "finalY");
    if (typeof finalY === "number" && Number.isFinite(finalY)) {
      return finalY;
    }
  }
  return fallbackY;
}

export function drawCharterHeader(
  doc: jsPDF,
  draft: CharterDraft,
  margin: number,
  pageWidth: number,
  contentWidth: number
): number {
  const version = draft.version ?? 1;
  const effectiveLabel = formatIndonesianDate(draft.effective_date);

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text("BATASJAMREG | DOKUMEN KESEPAKATAN KERJA", margin, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(113, 113, 122);
  doc.text(`Versi ${version} | Berlaku ${effectiveLabel}`, pageWidth - margin, 17, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(24, 24, 27);
  doc.text("PIAGAM JAM DIGITAL TIM", margin, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91);
  doc.text(
    "Kesepakatan Right-to-Disconnect & Komunikasi Kerja Asinkron",
    margin,
    32
  );

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.4);
  doc.line(margin, 36, pageWidth - margin, 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(24, 24, 27);
  const titleLines = doc.splitTextToSize(draft.title.trim(), contentWidth);
  doc.text(titleLines, margin, 44);

  const afterTitleY = 44 + titleLines.length * 5.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(63, 63, 70);
  doc.text(`Tim / Organisasi: ${draft.company_or_team_name.trim()}`, margin, afterTitleY);

  return afterTitleY;
}

export function drawCommitmentsAndSignatures(
  doc: jsPDF,
  draft: CharterDraft,
  signatures: ResolvedCharterSignatures,
  startY: number,
  margin: number,
  pageWidth: number,
  contentWidth: number,
  stampImage?: LoadedStampImage | null
): void {
  let cursorY = startY;
  if (cursorY > 228) {
    doc.addPage();
    cursorY = 22;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27);
  doc.text("Komitmen Operasional Tim", margin, cursorY);
  cursorY += 5.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.3);
  doc.setTextColor(63, 63, 70);
  for (const clause of COMMITMENT_CLAUSES) {
    const lines = doc.splitTextToSize(clause, contentWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 4.5 + 2;
  }

  drawCharterSignatureBlock(
    doc,
    draft,
    signatures,
    cursorY,
    margin,
    pageWidth,
    stampImage
  );
}

export function drawPageFooters(doc: jsPDF, margin: number): void {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `Halaman ${page} dari ${pageCount} | Dihasilkan lokal via BatasJamREG`,
      margin,
      288
    );
  }
}
