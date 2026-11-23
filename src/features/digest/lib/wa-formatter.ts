import type { IndonesiaTimezone } from "@/lib/constants/work-hours";
import type {
  DigestCardItem,
  DigestCardStatus,
  DigestTabKey,
  DigestTriageType,
} from "../types";

export interface FormatMorningDigestInput {
  workspaceName: string;
  cards: (Pick<
    DigestCardItem,
    "title" | "body" | "recipient_label" | "author_name"
  > & {
    triage_type?: DigestTriageType;
    status?: DigestCardStatus;
  })[];
  date?: Date;
  timezone?: IndonesiaTimezone | string;
}

export interface FormatEmergencyCardInput {
  title: string;
  recipient_label?: string | null;
  assignee_name?: string | null;
  emergency_reason?: string | null;
  body?: string | null;
  description?: string | null;
}

function normalizeInlineText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s*\u2014\s*/g, " - ")
    .trim();
}

export function formatDigestHeaderDate(
  date: Date = new Date(),
  timezone: string = "Asia/Jakarta"
): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: timezone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMorningDigestWhatsApp({
  workspaceName,
  cards,
  date = new Date(),
  timezone = "Asia/Jakarta",
}: FormatMorningDigestInput): string {
  const eligibleCards = cards.filter(
    (card) =>
      (card.triage_type === undefined || card.triage_type === "MORNING_QUEUE") &&
      (card.status === undefined || card.status === "QUEUED")
  );
  if (eligibleCards.length === 0) return "";

  const dateLabel = formatDigestHeaderDate(date, timezone);
  const cleanWorkspace = normalizeInlineText(workspaceName) || "Workspace Tim";
  const lines: string[] = [
    `*MORNING DIGEST - ${cleanWorkspace} (${dateLabel})*`,
    "",
  ];

  eligibleCards.forEach((card, index) => {
    const cleanRecipient =
      normalizeInlineText(card.recipient_label) || "Semua Tim";
    const cleanTitle = normalizeInlineText(card.title);
    const cleanBody = normalizeInlineText(card.body);
    const cleanAuthor = normalizeInlineText(card.author_name) || "Anggota Tim";

    lines.push(`${index + 1}. [${cleanRecipient}] ${cleanTitle}`);
    lines.push(`   ${cleanBody}`);
    lines.push(`   Dari: ${cleanAuthor}`);
    lines.push("");
  });

  lines.push(
    `Total: ${eligibleCards.length} instruksi siap dikerjakan pada jam kerja reguler.`
  );

  return lines.join("\n");
}

export function formatEmergencyWhatsAppMessage(
  card: FormatEmergencyCardInput,
  workspaceName: string
): string {
  const cleanWorkspace =
    normalizeInlineText(workspaceName) || "Workspace Tim";
  const cleanTitle = normalizeInlineText(card.title);
  const cleanPic =
    normalizeInlineText(card.assignee_name ?? "") ||
    normalizeInlineText(card.recipient_label ?? "") ||
    "Tim terkait";
  const cleanReason =
    normalizeInlineText(card.emergency_reason ?? "") || "Tidak dicantumkan";
  const cleanNotes =
    normalizeInlineText(card.description ?? "") ||
    normalizeInlineText(card.body ?? "");

  const lines: string[] = [
    `*[DARURAT OPERASIONAL - ${cleanWorkspace}]*`,
    `Instruksi: ${cleanTitle}`,
    `PIC: ${cleanPic}`,
    `Alasan Darurat: ${cleanReason}`,
  ];

  if (cleanNotes) {
    lines.push(`Catatan: ${cleanNotes}`);
  }

  lines.push("", "(Tercatat pada Audit Darurat BatasJamREG)");
  return lines.join("\n");
}

export function filterDigestCardsByTab(
  cards: DigestCardItem[],
  tab: DigestTabKey
): DigestCardItem[] {
  if (tab === "MORNING_QUEUE") {
    return cards.filter(
      (card) =>
        card.triage_type === "MORNING_QUEUE" && card.status === "QUEUED"
    );
  }

  if (tab === "EMERGENCY_OPS") {
    return cards.filter(
      (card) =>
        card.triage_type === "EMERGENCY_OPS" && card.status !== "ARCHIVED"
    );
  }

  return cards.filter((card) => card.status === "DISPATCHED");
}
