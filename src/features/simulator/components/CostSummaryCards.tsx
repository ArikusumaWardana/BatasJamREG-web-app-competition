import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatRupiah,
  formatRupiahCompact,
} from "../lib/presenteeism-formula";
import type { SimulatorOutput } from "../types";

interface CostSummaryCardsProps {
  output: SimulatorOutput;
}

export function CostSummaryCards({ output }: CostSummaryCardsProps) {
  const badgeClass =
    output.risk_level === "Tinggi"
      ? "border-danger/30 bg-danger-soft text-danger"
      : output.risk_level === "Sedang"
        ? "border-warn/30 bg-warn-soft text-warn"
        : "border-safe/30 bg-safe-soft text-safe";

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="rounded-[24px] border-stone-200/80 bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
        <CardContent className="flex h-full flex-col justify-between gap-2.5 pt-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink-secondary">
              Estimasi Risiko Presenteeism
            </span>
            <Badge variant="outline" className={cn("rounded-full text-[11px]", badgeClass)}>
              {output.risk_level}
            </Badge>
          </div>
          <p className="font-mono text-2xl font-semibold text-ink-primary tabular-nums sm:text-[28px]">
            {output.presenteeism_risk_pct.toLocaleString("id-ID", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
          </p>
          <p className="text-xs text-ink-secondary">
            Potensi penurunan efektivitas kerja (acuan maks. 51%)
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-0 bg-brand text-white shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
        <CardContent className="flex h-full flex-col justify-between gap-2.5 pt-5">
          <span className="text-xs font-medium text-white/80">
            Estimasi Kerugian Finansial
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-2xl font-bold text-white tabular-nums sm:text-[28px]">
              {formatRupiahCompact(output.annual_loss_idr)}
            </p>
            <span className="font-mono text-xs text-white/80 tabular-nums">
              {formatRupiah(output.annual_loss_idr)} / tahun
            </span>
          </div>
          <p className="text-xs text-white/80">
            Setara{" "}
            <span className="font-mono font-semibold text-white tabular-nums">
              {formatRupiahCompact(output.monthly_loss_idr)}
            </span>{" "}
            / bulan
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-stone-200/80 bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.03)] sm:col-span-2 xl:col-span-1">
        <CardContent className="flex h-full flex-col justify-between gap-2.5 pt-5">
          <span className="text-xs font-medium text-ink-secondary">
            Hari Kerja Efektif Hilang
          </span>
          <p className="font-mono text-2xl font-semibold text-ink-primary tabular-nums sm:text-[28px]">
            {output.lost_workdays_per_year.toLocaleString("id-ID")} Hari
          </p>
          <p className="text-xs text-ink-secondary">
            Rata-rata{" "}
            <span className="font-mono font-medium text-ink-primary tabular-nums">
              {output.lost_workdays_per_person_per_year.toLocaleString("id-ID", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>{" "}
            hari/orang/tahun (acuan maks. 34 hari)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
