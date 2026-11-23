import type { DivisionOverviewItem } from "../types";

interface OrgWellbeingMobileListProps {
  divisions: DivisionOverviewItem[];
}

function formatNumberId(val: number): string {
  return val.toFixed(1).replace(".", ",");
}

export function OrgWellbeingMobileList({
  divisions,
}: OrgWellbeingMobileListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {divisions.map((div) => {
        const wb = div.wellbeing;
        const ea = div.emergency_audit;
        const ca = div.charter_adoption;
        return (
          <article
            key={div.id}
            className="flex flex-col gap-2 rounded-md border border-border-hairline bg-canvas p-4 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-ink-primary">{div.name}</h3>
              <span className="font-mono tabular-nums text-warn">
                {div.latest_snapshot
                  ? `${formatNumberId(div.latest_snapshot.shadow_overtime_hours)} Jam`
                  : "Belum ada"}
              </span>
            </div>
            <p className="text-ink-secondary">
              Kesejahteraan:{" "}
              {wb?.is_threshold_met && wb.composite_score !== null ? (
                <strong className="font-mono text-safe tabular-nums">
                  {formatNumberId(wb.composite_score)} / 5,0 ({wb.response_count}{" "}
                  org)
                </strong>
              ) : (
                <span>
                  Menunggu minimal 3 responden ({wb?.response_count ?? 0}/3)
                </span>
              )}
            </p>
            <p className="font-mono tabular-nums text-ink-secondary">
              Skor Batas:{" "}
              {div.boundary_score
                ? `${div.boundary_score.score}/100 (${div.boundary_score.grade})`
                : "Belum ada"}{" "}
              | Piagam:{" "}
              {ca.adoption_percentage !== null
                ? `${ca.adoption_percentage}% (${ca.signed_count}/${ca.total_members})`
                : "Belum ada"}{" "}
              | Darurat: {ea.valid_count} Valid / {ea.false_alarm_count} Semu
            </p>
          </article>
        );
      })}
    </div>
  );
}
