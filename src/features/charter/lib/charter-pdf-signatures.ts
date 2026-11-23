import type { jsPDF } from "jspdf";
import type { CharterDraft } from "../types";
import {
  drawPdfLeaderStampGraphic,
  type LoadedStampImage,
} from "./charter-pdf-stamp";
import type { ResolvedCharterSignatures } from "./charter-signatures";

const SIGN_BOX_WIDTH = 74;

function fitSingleLine(doc: jsPDF, text: string, maxWidth: number): string {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  return lines[0] ?? text;
}

function drawLeaderDigitalStamp(
  doc: jsPDF,
  x: number,
  topY: number,
  italicName: string,
  metaLine: string,
  organizationName: string,
  stampImage?: LoadedStampImage | null
): void {
  const textWidth = 51;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(46, 111, 86);
  doc.text("TERVERIFIKASI DIGITAL", x, topY + 4.8);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(fitSingleLine(doc, italicName, textWidth), x, topY + 10.2);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(87, 83, 78);
  const metaLines = (doc.splitTextToSize(metaLine, textWidth) as string[]).slice(
    0,
    2
  );
  doc.text(metaLines, x, topY + 14.8);

  drawPdfLeaderStampGraphic(
    doc,
    x + 54,
    topY + 1.5,
    18.5,
    18.5,
    organizationName,
    stampImage
  );
}

function drawMemberDigitalStamp(
  doc: jsPDF,
  x: number,
  topY: number,
  badgeText: string,
  italicName: string,
  metaLine: string
): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(46, 111, 86);
  doc.text(fitSingleLine(doc, badgeText, SIGN_BOX_WIDTH), x, topY + 5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(fitSingleLine(doc, italicName, SIGN_BOX_WIDTH), x, topY + 11.2);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.6);
  doc.setTextColor(87, 83, 78);
  doc.text(fitSingleLine(doc, metaLine, SIGN_BOX_WIDTH), x, topY + 16.8);
}

function drawPendingLabel(doc: jsPDF, x: number, lineY: number, label: string): void {
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  doc.text(label, x, lineY - 3);
}

export function drawCharterSignatureBlock(
  doc: jsPDF,
  draft: CharterDraft,
  signatures: ResolvedCharterSignatures,
  cursorY: number,
  margin: number,
  pageWidth: number,
  stampImage?: LoadedStampImage | null
): void {
  let signY = cursorY + 8;
  if (signY > 234) {
    doc.addPage();
    signY = 30;
  }

  const leftSignX = margin;
  const rightSignX = pageWidth / 2 + 8;
  const workspaceName = draft.company_or_team_name.trim() || "Pimpinan Tim";
  const stampOrgName = draft.organization_name?.trim() || workspaceName;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(82, 82, 91);
  doc.text("Disetujui Oleh,", leftSignX, signY);
  doc.text("Disepakati Bersama,", rightSignX, signY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  doc.text("Pimpinan Tim / Manajemen", leftSignX, signY + 5);
  doc.text("Perwakilan Anggota Tim", rightSignX, signY + 5);

  const stampTopY = signY + 8;
  const lineY = signY + 32.5;
  const { mode, leaderSignoff, memberSignoff } = signatures;

  if (mode === "DIGITAL_SIGN") {
    if (leaderSignoff) {
      drawLeaderDigitalStamp(
        doc,
        leftSignX,
        stampTopY,
        leaderSignoff.name,
        `${leaderSignoff.signedAtFormatted} | Kode: ${leaderSignoff.verificationCode}`,
        stampOrgName,
        stampImage
      );
    } else {
      drawPendingLabel(doc, leftSignX, lineY, "[Menunggu persetujuan pimpinan]");
    }

    if (memberSignoff.signedCount > 0 && memberSignoff.representativeLabel) {
      drawMemberDigitalStamp(
        doc,
        rightSignX,
        stampTopY,
        `DISEPAKATI DIGITAL: ${memberSignoff.signedCount}/${memberSignoff.totalMembers} ANGGOTA`,
        memberSignoff.representativeLabel,
        memberSignoff.latestSignedAtFormatted
          ? `Terakhir: ${memberSignoff.latestSignedAtFormatted}`
          : "Persetujuan tercatat digital"
      );
    } else {
      drawPendingLabel(doc, rightSignX, lineY, "[Menunggu persetujuan anggota]");
    }
  }

  doc.setDrawColor(212, 212, 216);
  doc.setLineWidth(0.3);
  doc.line(leftSignX, lineY, leftSignX + SIGN_BOX_WIDTH, lineY);
  doc.line(rightSignX, lineY, rightSignX + SIGN_BOX_WIDTH, lineY);

  const leftCaption =
    mode === "DIGITAL_SIGN" && leaderSignoff
      ? `(${leaderSignoff.name} - ${leaderSignoff.roleLabel})`
      : `(${workspaceName})`;
  const rightCaption =
    mode === "DIGITAL_SIGN" &&
    memberSignoff.signedCount > 0 &&
    memberSignoff.representativeLabel
      ? `(${memberSignoff.representativeLabel})`
      : "(Seluruh Anggota Aktif)";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(113, 113, 122);
  doc.text(doc.splitTextToSize(leftCaption, SIGN_BOX_WIDTH), leftSignX, lineY + 4.8);
  doc.text(doc.splitTextToSize(rightCaption, SIGN_BOX_WIDTH), rightSignX, lineY + 4.8);
}
