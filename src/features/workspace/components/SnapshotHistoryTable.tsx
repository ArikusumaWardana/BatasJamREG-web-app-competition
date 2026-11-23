import type { SnapshotSummary } from "../types";

interface SnapshotHistoryTableProps {
  snapshots: SnapshotSummary[];
}

const MONTH_NAMES = [
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

function formatShortPeriod(start: string, end: string): string {
  const sParts = start.split("-");
  const eParts = end.split("-");
  const monthIdx = Number(eParts[1] ?? "1") - 1;
  const monthLabel = MONTH_NAMES[monthIdx] ?? eParts[1];
  return `${sParts[2]}-${eParts[2]} ${monthLabel}`;
}

export function computeAfterHoursPct(item: SnapshotSummary): number {
  if (item.total_messages <= 0) return 0;
  return Number(
    ((item.after_hours_messages / item.total_messages) * 100).toFixed(1)
  );
}

export function SnapshotHistoryTable({
  snapshots,
}: SnapshotHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-hairline text-xs font-medium text-ink-secondary">
            <th className="py-2 pr-3">Label Audit</th>
            <th className="px-3 py-2">Periode</th>
            <th className="px-3 py-2 text-right">Luar Jam (%)</th>
            <th className="py-2 pl-3 text-right">Lembur Bayangan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-hairline text-sm">
          {snapshots.map((item) => {
            const pct = computeAfterHoursPct(item);
            return (
              <tr key={item.id}>
                <td className="py-2.5 pr-3 font-medium text-ink-primary">
                  {item.label}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-ink-secondary">
                  {formatShortPeriod(item.period_start, item.period_end)}
                </td>
                <td
                  className={`px-3 py-2.5 text-right font-mono text-xs font-medium tabular-nums ${
                    pct <= 30 ? "text-safe" : "text-warn"
                  }`}
                >
                  {pct.toFixed(1).replace(".", ",")}%
                </td>
                <td className="py-2.5 pl-3 text-right font-mono text-xs font-semibold tabular-nums text-ink-primary">
                  {Number(item.shadow_overtime_hours)
                    .toFixed(1)
                    .replace(".", ",")}{" "}
                  Jam
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
