import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCharterTimeShort, type CharterDraft } from "../types";
import { drawAcknowledgementsAppendix } from "./charter-pdf-appendix";
import {
  drawCharterHeader,
  drawCommitmentsAndSignatures,
  drawPageFooters,
  getLastTableY,
} from "./charter-pdf-sections";

export function sanitizeCharterFilename(
  companyOrTeamName: string,
  version = 1
): string {
  const slug = companyOrTeamName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const safeSlug = slug.length > 0 ? slug : "tim";
  const safeVersion =
    Number.isFinite(version) && version >= 1 ? Math.floor(version) : 1;
  return `piagam-jam-digital-${safeSlug}-v${safeVersion}.pdf`;
}

export function buildCharterPdfDocument(draft: CharterDraft): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 18;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const afterTitleY = drawCharterHeader(
    doc,
    draft,
    margin,
    pageWidth,
    contentWidth
  );

  const quietStart = formatCharterTimeShort(draft.quiet_hours_start);
  const quietEnd = formatCharterTimeShort(draft.quiet_hours_end);
  const baselineLabel =
    draft.baseline_shadow_hours !== null &&
    draft.baseline_shadow_hours !== undefined
      ? `${draft.baseline_shadow_hours.toFixed(1)} jam / periode audit`
      : "Belum diukur";

  autoTable(doc, {
    startY: afterTitleY + 6,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Parameter Kebijakan", "Ketentuan Disepakati"]],
    body: [
      ["Jam Tenang (Quiet Hours)", `${quietStart} - ${quietEnd} WIB`],
      [
        "SLA Balasan Non-Darurat",
        `${draft.non_urgent_sla_hours} jam kerja pada hari kerja berikutnya`,
      ],
      ["Baseline Lembur Bayangan", baselineLabel],
      [
        "Kanal Penampungan Non-Darurat",
        "Async Morning Digest Board (BatasJamREG)",
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: 3.2,
      textColor: [24, 24, 27],
      lineColor: [228, 228, 231],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 64, fontStyle: "bold", fillColor: [244, 244, 245] },
      1: { cellWidth: contentWidth - 64 },
    },
  });

  const afterParamsY = getLastTableY(doc, afterTitleY + 48);

  autoTable(doc, {
    startY: afterParamsY + 7,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [
      ["No.", "Definisi Darurat Operasional (Boleh Dihubungi di Luar Jam Kerja)"],
    ],
    body: draft.emergency_criteria.map((criteria, index) => [
      `${index + 1}.`,
      criteria.trim(),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9.5,
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
      0: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      1: { cellWidth: contentWidth - 14 },
    },
  });

  const afterCriteriaY = getLastTableY(doc, afterParamsY + 45) + 9;
  drawCommitmentsAndSignatures(
    doc,
    draft,
    afterCriteriaY,
    margin,
    pageWidth,
    contentWidth
  );

  if (draft.acknowledgements && draft.acknowledgements.length > 0) {
    drawAcknowledgementsAppendix(
      doc,
      draft.acknowledgements,
      draft.company_or_team_name,
      draft.version ?? 1,
      margin,
      pageWidth,
      contentWidth
    );
  }

  drawPageFooters(doc, margin);

  return doc;
}

export function downloadCharterPdf(draft: CharterDraft): string {
  const doc = buildCharterPdfDocument(draft);
  const filename = sanitizeCharterFilename(
    draft.company_or_team_name,
    draft.version
  );
  doc.save(filename);
  return filename;
}
