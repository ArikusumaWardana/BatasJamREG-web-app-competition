import type { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CharterAcknowledgementItem } from "../types";
import { formatIndonesianDate } from "./charter-pdf-sections";

function formatSignedDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return formatIndonesianDate(isoString);
  }
  const dayLabel = formatIndonesianDate(isoString);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${dayLabel}, ${hh}:${mm}`;
}

export function drawAcknowledgementsAppendix(
  doc: jsPDF,
  acknowledgements: CharterAcknowledgementItem[],
  companyOrTeamName: string,
  version: number,
  margin: number,
  pageWidth: number,
  contentWidth: number
): void {
  if (acknowledgements.length === 0) return;

  doc.addPage();
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text("LAMPIRAN RESMI PIAGAM JAM DIGITAL", margin, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27);
  doc.text("Daftar Persetujuan Digital Anggota", margin, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(82, 82, 91);
  doc.text(
    `Tim: ${companyOrTeamName.trim()} | Versi ${version} | Total penanda tangan: ${acknowledgements.length} orang`,
    margin,
    31
  );

  autoTable(doc, {
    startY: 37,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      ["No.", "Nama Anggota", "Jabatan / Peran", "Tanggal Persetujuan Digital"],
    ],
    body: acknowledgements.map((item, idx) => [
      `${idx + 1}.`,
      item.full_name,
      item.role_title,
      formatSignedDateTime(item.signed_at),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9.2,
      cellPadding: 3,
      textColor: [24, 24, 27],
      lineColor: [228, 228, 231],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [19, 78, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 54 },
      2: { cellWidth: 46 },
      3: { cellWidth: contentWidth - 112 },
    },
  });
}
