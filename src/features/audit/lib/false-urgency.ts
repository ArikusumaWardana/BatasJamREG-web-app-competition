export const DEFAULT_FALSE_URGENCY_KEYWORDS: string[] = [
  "ASAP",
  "cek sebentar",
  "revisi besok pagi",
  "urgensi",
  "segera",
  "tolong cepat",
  "malam ini ya",
  "bentar aja",
];

export function normalizeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of keywords) {
    const trimmed = raw.trim();
    if (trimmed.length < 2) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

export function matchFalseUrgencyKeywords(
  message: string,
  keywords: string[]
): string[] {
  if (!message || keywords.length === 0) return [];
  const lowerMessage = message.toLowerCase();
  const matched: string[] = [];

  for (const keyword of keywords) {
    const cleanKeyword = keyword.trim().toLowerCase();
    if (cleanKeyword.length < 2) continue;
    if (lowerMessage.includes(cleanKeyword)) {
      matched.push(keyword.trim());
    }
  }

  return matched;
}
