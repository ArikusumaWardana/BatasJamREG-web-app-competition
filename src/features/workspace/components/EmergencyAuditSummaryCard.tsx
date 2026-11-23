import Link from "next/link";
import { ShieldAlert } from "lucide-react";
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
    <article className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <ShieldAlert className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Audit Darurat Operasional</span>
          </div>
          <h2 className="mt-1 text-base font-semibold text-ink-primary">
            Rasio Darurat Valid vs Darurat Semu
          </h2>
        </div>

        <span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-ink-primary">
          {ratio !== null ? `${ratio}% Valid` : "Belum Dievaluasi"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-md border border-border-hairline bg-canvas p-3">
          <p className="text-[11px] text-ink-secondary">Darurat Valid</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-safe">
            {valid}
          </p>
        </div>
        <div className="rounded-md border border-border-hairline bg-canvas p-3">
          <p className="text-[11px] text-ink-secondary">Seharusnya Pagi</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-danger">
            {falseAlarm}
          </p>
        </div>
        <div className="rounded-md border border-border-hairline bg-canvas p-3">
          <p className="text-[11px] text-ink-secondary">Menunggu Review</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-warn">
            {pending}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border-hairline pt-3 text-xs">
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
