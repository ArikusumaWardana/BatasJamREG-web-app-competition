import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  drawPageFooters,
  formatIndonesianDate,
  getLastTableY,
} from "@/features/charter/lib/charter-pdf-sections";
import type { OrganizationOverviewData } from "../types";
import {
  buildExecutiveReportMetrics,
  sanitizeExecutiveReportFilename,
} from "./executive-report-helpers";
import {
  drawExecutiveAnalysisPage,
  drawExecutiveHeader,
  formatExecutiveDec,
} from "./executive-report-pdf-sections";

export { sanitizeExecutiveReportFilename };

export function buildExecutiveReportPdf(
  overview: OrganizationOverviewData
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 16;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const issuedDate = formatIndonesianDate();
  const metrics = buildExecutiveReportMetrics(overview);

  const startY = drawExecutiveHeader(
    doc,
    "LAPORAN EKSEKUTIF KESEHATAN BATAS DIGITAL",
    `Organisasi: ${overview.organization.name}`,
    `Diterbitkan: ${issuedDate}`,
    margin,
    pageWidth
  );

  const avgScoreText =
    metrics.avg_boundary_score !== null
      ? `${metrics.avg_boundary_score} / 100`
      : "Belum tersedia";
  const highestBurnoutText = overview.kpis.highest_burnout_division
    ? `${overview.kpis.highest_burnout_division.name} (${formatExecutiveDec(overview.kpis.highest_burnout_division.shadow_overtime_hours)} jam)`
    : "Belum ada data snapshot";
  const validEmergencyText =
    overview.kpis.emergency_audit.valid_ratio_pct !== null
      ? `${overview.kpis.emergency_audit.valid_ratio_pct}% (${overview.kpis.emergency_audit.valid_count} valid / ${overview.kpis.emergency_audit.false_alarm_count} semu)`
      : `${overview.kpis.emergency_audit.total_emergency} eskalasi tercatat`;

  autoTable(doc, {
    startY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Indikator Kunci Perusahaan", "Capaian Terkini"]],
    body: [
      ["Total Divisi Aktif", `${overview.kpis.total_divisions} divisi`],
      ["Total Anggota Unik Organisasi", `${overview.kpis.total_members} orang`],
      [
        "Akumulasi Lembur Bayangan Lintas Divisi",
        `${formatExecutiveDec(overview.kpis.total_shadow_overtime_hours)} jam`,
      ],
      ["Rata-rata Skor Batas Digital", avgScoreText],
      ["Divisi Risiko Burnout Tertinggi", highestBurnoutText],
      ["Rasio Darurat Operasional Valid", validEmergencyText],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9,
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
    columnStyles: {
      0: { cellWidth: 74, fontStyle: "bold", fillColor: [244, 244, 245] },
      1: { cellWidth: contentWidth - 74 },
    },
  });

  const afterKpiY = getLastTableY(doc, startY + 56) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27);
  doc.text("Perbandingan Kesehatan & Tata Kelola Lintas Divisi", margin, afterKpiY);

  autoTable(doc, {
    startY: afterKpiY + 3.5,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      [
        "Divisi",
        "Lembur",
        "Skor Batas",
        "Adopsi Piagam",
        "Wellbeing Pulse",
        "Darurat Valid",
      ],
    ],
    body: overview.divisions.map((div) => [
      div.name,
      div.latest_snapshot
        ? `${formatExecutiveDec(div.latest_snapshot.shadow_overtime_hours)} jam`
        : "Belum ada",
      div.boundary_score
        ? `${div.boundary_score.score}/100 (${div.boundary_score.grade})`
        : "-",
      div.charter_adoption.adoption_percentage !== null
        ? `${div.charter_adoption.adoption_percentage}% (${div.charter_adoption.signed_count}/${div.charter_adoption.total_members})`
        : "Belum ada",
      div.wellbeing?.is_threshold_met && div.wellbeing.composite_score !== null
        ? `${formatExecutiveDec(div.wellbeing.composite_score)}/5 (${div.wellbeing.response_count} org)`
        : `Tunggu (${div.wellbeing?.response_count ?? 0}/3)`,
      div.emergency_audit.total_emergency > 0
        ? div.emergency_audit.valid_ratio_pct !== null
          ? `${div.emergency_audit.valid_ratio_pct}% (${div.emergency_audit.valid_count}/${div.emergency_audit.total_emergency})`
          : `${div.emergency_audit.pending_count} pending`
        : "Nol eskalasi",
    ]),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.6,
      textColor: [24, 24, 27],
      lineColor: [228, 228, 231],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [19, 78, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  drawExecutiveAnalysisPage(
    doc,
    overview,
    metrics,
    margin,
    pageWidth,
    contentWidth
  );
  drawPageFooters(doc, margin);
  return doc;
}

export function downloadExecutiveReportPdf(
  overview: OrganizationOverviewData
): string {
  const doc = buildExecutiveReportPdf(overview);
  const filename = sanitizeExecutiveReportFilename(overview.organization.name);
  doc.save(filename);
  return filename;
}
