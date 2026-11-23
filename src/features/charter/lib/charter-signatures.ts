import { getTimezoneShortLabel } from "@/lib/constants/work-hours";
import type { CharterAcknowledgementItem, CharterSignerRole } from "../types";

export type CharterSignatureMode = "MANUAL_PRINT" | "DIGITAL_SIGN";

export interface LeaderSignoffInfo {
  name: string;
  roleLabel: string;
  workspaceRole: "OWNER" | "LEAD";
  signedAtFormatted: string;
  verificationCode: string;
}

export interface MemberSignoffInfo {
  signedCount: number;
  totalMembers: number;
  representativeLabel: string | null;
  latestSignedAtFormatted: string | null;
}

export interface ResolvedCharterSignatures {
  mode: CharterSignatureMode;
  leaderSignoff: LeaderSignoffInfo | null;
  memberSignoff: MemberSignoffInfo;
}

const INDONESIAN_SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatIndonesianSignedAt(
  isoString: string,
  timezone = "Asia/Jakarta"
): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const day = Number(parts.find((p) => p.type === "day")?.value ?? "1");
  const monthIdx =
    Number(parts.find((p) => p.type === "month")?.value ?? "1") - 1;
  const year = parts.find((p) => p.type === "year")?.value ?? "2026";
  const rawHour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const hour = rawHour === "24" ? "00" : rawHour.padStart(2, "0");
  const minute = (
    parts.find((p) => p.type === "minute")?.value ?? "00"
  ).padStart(2, "0");
  const monthLabel = INDONESIAN_SHORT_MONTHS[monthIdx] ?? "Jan";
  const tzLabel = getTimezoneShortLabel(timezone);

  return `${day} ${monthLabel} ${year}, ${hour}:${minute} ${tzLabel}`;
}

function resolveEffectiveRole(
  item: CharterAcknowledgementItem
): CharterSignerRole {
  if (
    item.workspace_role === "OWNER" ||
    item.workspace_role === "LEAD" ||
    item.workspace_role === "MEMBER"
  ) {
    return item.workspace_role;
  }

  const normalized = item.role_title.trim();
  if (/\b(owner|direktur|ceo|founder|pemilik)\b/i.test(normalized)) {
    return "OWNER";
  }
  if (/\b(lead|kepala|manager|manajer|head|pimpinan|vp|chief)\b/i.test(normalized)) {
    return "LEAD";
  }
  return "MEMBER";
}

function resolveLeaderSignoff(
  sorted: CharterAcknowledgementItem[],
  timezone: string
): LeaderSignoffInfo | null {
  const leadSigner = sorted.find(
    (item) => resolveEffectiveRole(item) === "LEAD"
  );
  const ownerSigner = sorted.find(
    (item) => resolveEffectiveRole(item) === "OWNER"
  );
  const leader = leadSigner ?? ownerSigner;
  if (!leader) return null;

  const resolvedRole: "OWNER" | "LEAD" = leadSigner ? "LEAD" : "OWNER";
  const cleanName = leader.full_name.trim() || "Pimpinan Tim";
  const cleanRole =
    leader.role_title.trim() ||
    (resolvedRole === "LEAD" ? "Pimpinan Divisi" : "Pemilik Organisasi");

  return {
    name: cleanName,
    roleLabel: cleanRole,
    workspaceRole: resolvedRole,
    signedAtFormatted: formatIndonesianSignedAt(leader.signed_at, timezone),
    verificationCode: leader.id.trim().slice(0, 8).toUpperCase(),
  };
}

export function resolveCharterSignatures(
  acknowledgements: CharterAcknowledgementItem[] | null | undefined,
  totalMembers?: number | null,
  timezone = "Asia/Jakarta"
): ResolvedCharterSignatures {
  if (
    acknowledgements === null ||
    acknowledgements === undefined ||
    (acknowledgements.length === 0 && (!totalMembers || totalMembers <= 0))
  ) {
    return {
      mode: "MANUAL_PRINT",
      leaderSignoff: null,
      memberSignoff: {
        signedCount: 0,
        totalMembers: 0,
        representativeLabel: null,
        latestSignedAtFormatted: null,
      },
    };
  }

  const sorted = [...acknowledgements].sort(
    (a, b) => new Date(a.signed_at).getTime() - new Date(b.signed_at).getTime()
  );

  const leaderSignoff = resolveLeaderSignoff(sorted, timezone);
  const memberSigners = sorted.filter(
    (item) => resolveEffectiveRole(item) === "MEMBER"
  );
  const resolvedTotalMembers = Math.max(totalMembers ?? 0, memberSigners.length);

  let representativeLabel: string | null = null;
  let latestSignedAtFormatted: string | null = null;

  if (memberSigners.length === 1) {
    representativeLabel = memberSigners[0].full_name.trim() || "Anggota Tim";
    latestSignedAtFormatted = formatIndonesianSignedAt(
      memberSigners[0].signed_at,
      timezone
    );
  } else if (memberSigners.length > 1) {
    const firstName = memberSigners[0].full_name.trim() || "Anggota Tim";
    representativeLabel = `${firstName} & ${memberSigners.length - 1} Anggota Lainnya`;
    const latest = memberSigners[memberSigners.length - 1];
    latestSignedAtFormatted = formatIndonesianSignedAt(
      latest.signed_at,
      timezone
    );
  }

  return {
    mode: "DIGITAL_SIGN",
    leaderSignoff,
    memberSignoff: {
      signedCount: memberSigners.length,
      totalMembers: resolvedTotalMembers,
      representativeLabel,
      latestSignedAtFormatted,
    },
  };
}
