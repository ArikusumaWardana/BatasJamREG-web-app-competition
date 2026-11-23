import type { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLastTableY } from "@/features/charter/lib/charter-pdf-sections";
import { formatRupiah } from "@/features/simulator/lib/presenteeism-formula";
import type { OrganizationOverviewData } from "../types";
import type { ExecutiveReportSummaryMetrics } from "./executive-report-helpers";

export function formatExecutiveDec(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function drawExecutiveHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  rightMeta: string,
  margin: number,
  pageWidth: number
): number {
  doc.setFillColor(30, 78, 86);
  doc.rect(0, 0, pageWidth, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 78, 86);
  doc.text("BATASJAMREG | RINGKASAN EKSEKUTIF PERUSAHAAN", margin, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(113, 113, 122);
  doc.text(rightMeta, pageWidth - margin, 17, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(24, 24, 27);
  doc.text(title, margin, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91);
  doc.text(subtitle, margin, 32);

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.4);
  doc.line(margin, 36, pageWidth - margin, 36);
  return 42;
}

export function drawExecutiveAnalysisPage(
  doc: jsPDF,
  overview: OrganizationOverviewData,
  metrics: ExecutiveReportSummaryMetrics,
  margin: number,
  pageWidth: number,
  contentWidth: number
): void {
  doc.addPage();
  const page2StartY = drawExecutiveHeader(
    doc,
    "BIAYA PRESENTEEISM & REKOMENDASI TINDAK LANJUT",
    `Organisasi: ${overview.organization.name}`,
    "Halaman Analisis Finansial",
    margin,
    pageWidth
  );

  autoTable(doc, {
    startY: page2StartY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        "Divisi",
        "Anggota",
        "Jam/Minggu",
        "Hari Hilang/Thn",
        "Estimasi Biaya/Thn",
        "Potensi Hemat/Thn",
      ],
    ],
    body: [
      ...metrics.division_costs.map((row) => [
        row.division_name,
        `${row.member_count} org`,
        `${formatExecutiveDec(row.weekly_shadow_hours)} jam`,
        `${row.lost_workdays_per_year} hari`,
        formatRupiah(row.annual_loss_idr),
        formatRupiah(row.projected_savings_idr),
      ]),
      [
        "TOTAL PERUSAHAAN",
        `${overview.kpis.total_members} org`,
        "-",
        `${metrics.total_lost_workdays_per_year} hari`,
        formatRupiah(metrics.total_annual_loss_idr),
        formatRupiah(metrics.total_projected_savings_idr),
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.8,
      textColor: [24, 24, 27],
      lineColor: [228, 228, 231],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [30, 78, 86],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  let cursorY = getLastTableY(doc, page2StartY + 55) + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91);
  const assumptionNote = `Asumsi simulasi: rata-rata gaji referensi ${formatRupiah(metrics.assumed_monthly_salary_idr)}/bulan per anggota, mengacu benchmark kerugian ekonomi kesehatan mental pekerja Indonesia (Rp463 triliun/tahun, kontribusi presenteeism 88,5%, maks 34 hari kerja hilang/orang/tahun).`;
  const noteLines = doc.splitTextToSize(assumptionNote, contentWidth);
  doc.text(noteLines, margin, cursorY);
  cursorY += noteLines.length * 4.2 + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27);
  doc.text("Rekomendasi Tindak Lanjut Manajemen", margin, cursorY);
  cursorY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  doc.setTextColor(39, 39, 42);
  metrics.recommendations.forEach((rec, index) => {
    const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, contentWidth);
    doc.text(recLines, margin, cursorY);
    cursorY += recLines.length * 4.5 + 2.5;
  });

  cursorY += 4;
  doc.setFillColor(244, 244, 242);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 78, 86);
  doc.text(
    "Catatan Arsitektur Privasi (Zero-Upload & K-Anonymity)",
    margin + 4,
    cursorY + 6.5
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(82, 82, 91);
  const privacyText = doc.splitTextToSize(
    "Laporan ini disusun sepenuhnya di browser dari metrik numerik teragregasi. Isi pesan WhatsApp mentah tidak pernah diunggah ke server, dan skor Wellbeing Pulse hanya ditampilkan jika minimal 3 anggota mengisi dalam minggu yang sama.",
    contentWidth - 8
  );
  doc.text(privacyText, margin + 4, cursorY + 11.5);
}
