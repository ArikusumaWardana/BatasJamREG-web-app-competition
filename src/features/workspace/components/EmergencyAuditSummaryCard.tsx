import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import {
  BENTO_CARD_CLS,
  BENTO_INNER_CARD_CLS,
  BentoCardHeader,
} from "@/components/shared/BentoPrimitives";
import type { EmergencyAuditSummary } from "@/features/wellbeing/types";

interface EmergencyAuditSummaryCardProps {
  summary?: EmergencyAuditSummary;
  workspaceId: string;
}

export function EmergencyAuditSummaryCard({
  summary,
  workspaceId,
}: EmergencyAuditSummaryCardProps) {
  const valid = summary?.valid_count ?? 0;
  const falseAlarm = summary?.false_alarm_count ?? 0;
  const pending = summary?.pending_count ?? 0;
  const total = summary?.total_emergency ?? 0;
  const ratio = summary?.valid_ratio_pct ?? null;

  return (
    <article className={`flex flex-col gap-4 ${BENTO_CARD_CLS}`}>
      <BentoCardHeader
        icon={<ShieldAlert className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
        title="Rasio Darurat Valid vs Darurat Semu"
        subtitle="Audit Darurat Operasional"
        rightSlot={
          <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-medium tabular-nums text-ink-primary">
            {ratio !== null ? `${ratio}% Valid` : "Belum Dievaluasi"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={BENTO_INNER_CARD_CLS}>
          <p className="text-[11px] font-medium text-ink-secondary">
            Darurat Valid
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-safe">
            {valid}
          </p>
        </div>
        <div className={BENTO_INNER_CARD_CLS}>
          <p className="text-[11px] font-medium text-ink-secondary">
            Seharusnya Pagi
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-danger">
            {falseAlarm}
          </p>
        </div>
        <div className={BENTO_INNER_CARD_CLS}>
          <p className="text-[11px] font-medium text-ink-secondary">
            Menunggu Review
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums text-warn">
            {pending}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs">
        <span className="text-ink-secondary">
          Total eskalasi darurat aktif:{" "}
          <strong className="font-mono tabular-nums text-ink-primary">
            {total}
          </strong>
        </span>
        <Link
          href={`/workspace/digest?ws=${workspaceId}`}
          className="font-medium text-brand hover:underline"
        >
          Evaluasi di Morning Digest
        </Link>
      </div>
    </article>
  );
}
