"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { DigitalStampSvg } from "@/components/shared/DigitalStampSvg";
import { resolveCharterSignatures } from "../lib/charter-signatures";
import type { CharterDraft } from "../types";

interface CharterSignatureFooterProps {
  draft: CharterDraft;
}

export function CharterSignatureFooter({
  draft,
}: CharterSignatureFooterProps) {
  const [failedStampUrl, setFailedStampUrl] = useState<string | null>(null);

  const signatures = resolveCharterSignatures(
    draft.acknowledgements,
    draft.total_members,
    draft.timezone
  );
  const workspaceName = draft.company_or_team_name.trim() || "Pimpinan Tim";
  const stampOrgName =
    draft.organization_name?.trim() || workspaceName || "BatasJamREG";

  if (signatures.mode === "MANUAL_PRINT") {
    return (
      <footer className="mt-1 grid grid-cols-1 gap-6 border-t border-border-hairline pt-5 sm:grid-cols-2">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-medium text-ink-secondary">
            Disetujui Oleh (Pimpinan Tim / Manajemen)
          </span>
          <div className="border-t border-border-strong pt-2">
            <p className="text-xs font-medium text-ink-primary">
              ({workspaceName})
            </p>
            <p className="font-mono text-xs text-ink-muted">
              Tanggal: .... / .... / 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <span className="text-xs font-medium text-ink-secondary">
            Disepakati Bersama (Perwakilan Anggota Tim)
          </span>
          <div className="border-t border-border-strong pt-2">
            <p className="text-xs font-medium text-ink-primary">
              (Seluruh Anggota Aktif)
            </p>
            <p className="font-mono text-xs text-ink-muted">
              Tanggal: .... / .... / 2026
            </p>
          </div>
        </div>
      </footer>
    );
  }

  const { leaderSignoff, memberSignoff } = signatures;
  const activeStampUrl =
    draft.organization_stamp_url && draft.organization_stamp_url !== failedStampUrl
      ? draft.organization_stamp_url
      : null;

  return (
    <footer className="mt-1 grid grid-cols-1 gap-6 border-t border-border-hairline pt-5 sm:grid-cols-2">
      <div className="flex flex-col justify-between gap-3">
        <span className="text-xs font-medium text-ink-secondary">
          Disetujui Oleh (Pimpinan Tim / Manajemen)
        </span>

        {leaderSignoff ? (
          <div className="flex min-h-[84px] items-center justify-between gap-3 py-1">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold tracking-wider text-safe">
                <ShieldCheck
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>TERVERIFIKASI DIGITAL</span>
              </span>
              <p className="text-sm font-medium italic text-ink-primary">
                {leaderSignoff.name}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-ink-secondary">
                {leaderSignoff.signedAtFormatted} | Kode:{" "}
                {leaderSignoff.verificationCode}
              </p>
            </div>

            {activeStampUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeStampUrl}
                alt={`Stempel ${stampOrgName}`}
                crossOrigin="anonymous"
                onError={() => setFailedStampUrl(activeStampUrl)}
                className="pointer-events-none max-h-[84px] w-auto max-w-[84px] shrink-0 rotate-[-6deg] object-contain opacity-85 mix-blend-multiply select-none"
              />
            ) : (
              <DigitalStampSvg
                organizationName={stampOrgName}
                className="pointer-events-none h-[76px] w-[76px] shrink-0 rotate-[-6deg] opacity-85 select-none"
              />
            )}
          </div>
        ) : (
          <div className="flex min-h-[84px] items-end pb-1">
            <span className="text-xs italic text-ink-muted">
              [Menunggu persetujuan pimpinan]
            </span>
          </div>
        )}

        <div className="border-t border-border-strong pt-2">
          <p className="text-xs font-medium text-ink-primary">
            {leaderSignoff
              ? `(${leaderSignoff.name} - ${leaderSignoff.roleLabel})`
              : `(${workspaceName})`}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3">
        <span className="text-xs font-medium text-ink-secondary">
          Disepakati Bersama (Perwakilan Anggota Tim)
        </span>

        {memberSignoff.signedCount > 0 ? (
          <div className="flex min-h-[84px] flex-col justify-end gap-1.5 py-1">
            <span className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold tracking-wider text-safe tabular-nums">
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                DISEPAKATI DIGITAL: {memberSignoff.signedCount}/
                {memberSignoff.totalMembers} ANGGOTA
              </span>
            </span>
            <p className="text-sm font-medium italic text-ink-primary">
              {memberSignoff.representativeLabel}
            </p>
            {memberSignoff.latestSignedAtFormatted ? (
              <p className="font-mono text-[11px] tabular-nums text-ink-secondary">
                Terakhir: {memberSignoff.latestSignedAtFormatted}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[84px] items-end pb-1">
            <span className="text-xs italic text-ink-muted">
              [Menunggu persetujuan anggota]
            </span>
          </div>
        )}

        <div className="border-t border-border-strong pt-2">
          <p className="text-xs font-medium text-ink-primary">
            {memberSignoff.signedCount > 0 && memberSignoff.representativeLabel
              ? `(${memberSignoff.representativeLabel})`
              : "(Seluruh Anggota Aktif)"}
          </p>
        </div>
      </div>
    </footer>
  );
}
