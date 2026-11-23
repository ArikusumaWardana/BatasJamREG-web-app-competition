import {
  calculatePresenteeismCost,
  DEFAULT_SIMULATOR_INPUT,
} from "@/features/simulator/lib/presenteeism-formula";
import type { NightInterruptionIntensity } from "@/features/simulator/types";
import type {
  DivisionOverviewItem,
  OrganizationOverviewData,
} from "../types";

export interface DivisionPresenteeismRow {
  division_id: string;
  division_name: string;
  member_count: number;
  weekly_shadow_hours: number;
  lost_workdays_per_year: number;
  annual_loss_idr: number;
  projected_savings_idr: number;
}

export interface ExecutiveReportSummaryMetrics {
  avg_boundary_score: number | null;
  assumed_monthly_salary_idr: number;
  division_costs: DivisionPresenteeismRow[];
  total_annual_loss_idr: number;
  total_projected_savings_idr: number;
  total_lost_workdays_per_year: number;
  recommendations: string[];
}

function estimateAuditWeeks(periodStart: string, periodEnd: string): number {
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    return 4;
  }
  const spanDays = Math.floor((endMs - startMs) / 86400000) + 1;
  return Math.max(1, spanDays / 7);
}

function resolveIntensity(div: DivisionOverviewItem): NightInterruptionIntensity {
  const snap = div.latest_snapshot;
  if (!snap || snap.total_messages <= 0) return "LOW";
  const pct = (snap.after_hours_messages / snap.total_messages) * 100;
  if (pct >= 30) return "HIGH";
  if (pct >= 15) return "MEDIUM";
  return "LOW";
}

function buildRecommendations(
  overview: OrganizationOverviewData,
  avgBoundaryScore: number | null
): string[] {
  const list: string[] = [];
  const burnout = overview.kpis.highest_burnout_division;

  if (burnout) {
    list.push(
      `Prioritaskan penegakan jam tenang dan penyebaran Piagam Jam Digital pada ${burnout.name} (${burnout.shadow_overtime_hours.toFixed(1).replace(".", ",")} jam lembur bayangan).`
    );
  }

  const lowAdoption = overview.divisions.filter(
    (div) =>
      div.charter_adoption.adoption_percentage !== null &&
      div.charter_adoption.adoption_percentage < 80
  );
  if (lowAdoption.length > 0) {
    list.push(
      `Dorong persetujuan digital Piagam Jam Digital pada ${lowAdoption.map((d) => d.name).join(", ")} hingga mencapai minimal 80% anggota aktif.`
    );
  }

  const { false_alarm_count, pending_count } = overview.kpis.emergency_audit;
  if (false_alarm_count > 0 || pending_count > 0) {
    list.push(
      `Lakukan kalibrasi kriteria darurat di Morning Digest Board (${false_alarm_count} eskalasi semu dan ${pending_count} kartu menunggu tinjauan Lead/Owner).`
    );
  }

  if (avgBoundaryScore !== null && avgBoundaryScore < 75) {
    list.push(
      `Tingkatkan rata-rata Skor Batas Digital (${avgBoundaryScore}/100) dengan mengarahkan koordinasi malam non-mendesak ke antrean Morning Digest harian.`
    );
  }

  if (list.length === 0) {
    list.push(
      "Pertahankan kedisiplinan jam reguler melalui check-in Wellbeing Pulse mingguan dan tinjauan audit WA bulanan per divisi."
    );
  }

  return list.slice(0, 4);
}

export function sanitizeExecutiveReportFilename(orgName: string): string {
  const slug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const safeSlug = slug.length > 0 ? slug : "perusahaan";
  return `laporan-eksekutif-${safeSlug}.pdf`;
}

export function buildExecutiveReportMetrics(
  overview: OrganizationOverviewData
): ExecutiveReportSummaryMetrics {
  const scores = overview.divisions
    .map((div) => div.boundary_score?.score)
    .filter((score): score is number => typeof score === "number");

  const avgBoundaryScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length)
      : null;

  const assumedSalary = DEFAULT_SIMULATOR_INPUT.avg_monthly_salary_idr;

  const divisionCosts: DivisionPresenteeismRow[] = overview.divisions.map(
    (div) => {
      const snap = div.latest_snapshot;
      if (!snap || div.member_count <= 0) {
        return {
          division_id: div.id,
          division_name: div.name,
          member_count: div.member_count,
          weekly_shadow_hours: 0,
          lost_workdays_per_year: 0,
          annual_loss_idr: 0,
          projected_savings_idr: 0,
        };
      }

      const weeks = estimateAuditWeeks(snap.period_start, snap.period_end);
      const weeklyHours = Number((snap.shadow_overtime_hours / weeks).toFixed(1));
      const sim = calculatePresenteeismCost({
        team_size: div.member_count,
        avg_monthly_salary_idr: assumedSalary,
        weekly_shadow_overtime_hours: weeklyHours,
        night_interruption_intensity: resolveIntensity(div),
      });

      return {
        division_id: div.id,
        division_name: div.name,
        member_count: div.member_count,
        weekly_shadow_hours: weeklyHours,
        lost_workdays_per_year: sim.lost_workdays_per_year,
        annual_loss_idr: sim.annual_loss_idr,
        projected_savings_idr: sim.projected_annual_savings_idr,
      };
    }
  );

  const totalAnnualLossIdr = divisionCosts.reduce(
    (acc, row) => acc + row.annual_loss_idr,
    0
  );
  const totalProjectedSavingsIdr = divisionCosts.reduce(
    (acc, row) => acc + row.projected_savings_idr,
    0
  );
  const totalLostWorkdays = divisionCosts.reduce(
    (acc, row) => acc + row.lost_workdays_per_year,
    0
  );

  return {
    avg_boundary_score: avgBoundaryScore,
    assumed_monthly_salary_idr: assumedSalary,
    division_costs: divisionCosts,
    total_annual_loss_idr: totalAnnualLossIdr,
    total_projected_savings_idr: totalProjectedSavingsIdr,
    total_lost_workdays_per_year: totalLostWorkdays,
    recommendations: buildRecommendations(overview, avgBoundaryScore),
  };
}
