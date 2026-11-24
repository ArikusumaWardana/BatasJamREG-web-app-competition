"use client";

import { FileCheck2, ShieldAlert } from "lucide-react";
import {
  AvatarStack,
  BENTO_CARD_CLS,
  BENTO_INNER_CARD_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import type { DivisionOverviewItem, OrganizationSummaryKpi } from "../types";

interface OrgCharterEmergencyCardProps {
  divisions: DivisionOverviewItem[];
  kpis: OrganizationSummaryKpi;
}

export function OrgCharterEmergencyCard({
  divisions,
  kpis,
}: OrgCharterEmergencyCardProps) {
  const leadNames = Array.from(
    new Set(
      divisions.flatMap((div) => div.team_leads.map((lead) => lead.full_name))
    )
  );

  const charterDivs = divisions.filter(
    (d) => d.charter_adoption.adoption_percentage !== null
  );
  const totalSigned = charterDivs.reduce(
    (sum, d) => sum + d.charter_adoption.signed_count,
    0
  );
  const totalMembers = charterDivs.reduce(
    (sum, d) => sum + d.charter_adoption.total_members,
    0
  );
  const avgAdoption =
    totalMembers > 0 ? Math.round((totalSigned / totalMembers) * 100) : 0;

  const ea = kpis.emergency_audit;

  return (
    <article className={`flex h-full flex-col justify-between gap-4 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<FileCheck2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        iconToneClass="bg-safe-soft text-safe"
        title="Adopsi Piagam & Darurat"
        subtitle="Komitmen digital lintas divisi"
        actionHref="/charter"
        actionLabel="Buka studio piagam"
      />

      <div className={BENTO_INNER_CARD_CLS}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Rata-rata Adopsi Piagam
          </span>
          <span className="rounded-full bg-safe-soft px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-safe">
            {charterDivs.length > 0 ? `${avgAdoption}%` : "Belum ada"}
          </span>
        </div>

        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
          <div
            className="h-full rounded-full bg-safe transition-all"
            style={{ width: `${avgAdoption}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] tabular-nums text-ink-secondary">
            {totalSigned}/{totalMembers} tanda tangan tercatat
          </span>
          <AvatarStack
            names={leadNames.length > 0 ? leadNames : divisions.map((d) => d.name)}
            maxVisible={3}
            sizeClass="h-7 w-7 text-[10px]"
          />
        </div>
      </div>

      <div className={BENTO_INNER_CARD_CLS}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            <ShieldAlert className="h-3.5 w-3.5 text-warn" strokeWidth={1.5} aria-hidden="true" />
            <span>Audit Darurat Operasional</span>
          </span>
          <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-ink-primary">
            {ea.valid_ratio_pct !== null ? `${ea.valid_ratio_pct}% Valid` : "Belum diulas"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-surface p-2">
            <p className="font-mono text-base font-semibold tabular-nums text-safe">
              {ea.valid_count}
            </p>
            <p className="text-[10px] text-ink-secondary">Valid</p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="font-mono text-base font-semibold tabular-nums text-danger">
              {ea.false_alarm_count}
            </p>
            <p className="text-[10px] text-ink-secondary">Semu</p>
          </div>
          <div className="rounded-xl bg-surface p-2">
            <p className="font-mono text-base font-semibold tabular-nums text-warn">
              {ea.pending_count}
            </p>
            <p className="text-[10px] text-ink-secondary">Menunggu</p>
          </div>
        </div>
      </div>
    </article>
  );
}
