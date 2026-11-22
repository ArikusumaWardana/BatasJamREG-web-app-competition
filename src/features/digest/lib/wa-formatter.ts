import type { IndonesiaTimezone } from "@/lib/constants/work-hours";
import type { DigestCardItem, DigestTabKey } from "../types";

export interface FormatMorningDigestInput {
  workspaceName: string;
  cards: Pick<
    DigestCardItem,
    "title" | "body" | "recipient_label" | "author_name"
  >[];
  date?: Date;
  timezone?: IndonesiaTimezone | string;
}

function normalizeInlineText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n+/g, " ").trim();
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
  if (cards.length === 0) return "";

  const dateLabel = formatDigestHeaderDate(date, timezone);
  const cleanWorkspace = normalizeInlineText(workspaceName) || "Workspace Tim";
  const lines: string[] = [
    `*MORNING DIGEST - ${cleanWorkspace} (${dateLabel})*`,
    "",
  ];

  cards.forEach((card, index) => {
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
    `Total: ${cards.length} instruksi siap dikerjakan pada jam kerja reguler.`
  );

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
