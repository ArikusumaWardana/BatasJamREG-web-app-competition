import type { FalseUrgencyHit } from "../types";

interface FalseUrgencyTableProps {
  items: FalseUrgencyHit[];
  totalHits: number;
  hasResult: boolean;
}

export function FalseUrgencyTable({
  items,
  totalHits,
  hasResult,
}: FalseUrgencyTableProps) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-4 rounded-[24px] border border-stone-200/80 bg-surface p-6 shadow-[0_1px_2px_rgba(28,25,23,0.03)] lg:col-span-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-primary">
          Frekuensi Frasa False Urgency
        </h2>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-medium tabular-nums text-ink-secondary">
          Total: {totalHits} kejadian
        </span>
      </div>

      {!hasResult ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-bento-canvas/50 p-6 text-center text-sm text-ink-secondary">
          Rincian frasa urgensi semu akan tampil setelah file chat selesai
          diproses.
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-bento-canvas/50 p-6 text-center text-sm text-ink-secondary">
          Tidak ditemukan frasa pemicu dari daftar kata kunci yang aktif saat
          ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200/80 text-xs font-medium whitespace-nowrap text-ink-secondary">
                <th className="py-2.5 pr-3">Frasa</th>
                <th className="px-3 py-2.5 text-right">Total</th>
                <th className="px-3 py-2.5 text-right">Luar Jam</th>
                <th className="py-2.5 pl-3 text-right">Porsi Luar Jam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {items.map((item) => {
                const afterPct =
                  item.count > 0
                    ? ((item.after_hours_count / item.count) * 100)
                        .toFixed(1)
                        .replace(".", ",")
                    : "0,0";

                return (
                  <tr key={item.keyword}>
                    <td className="py-2.5 pr-3 text-ink-primary">
                      &ldquo;{item.keyword}&rdquo;
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-ink-primary">
                      {item.count}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs font-medium tabular-nums text-warn">
                      {item.after_hours_count}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono text-xs tabular-nums text-ink-secondary">
                      {afterPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
