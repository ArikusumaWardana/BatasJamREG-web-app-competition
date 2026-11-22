import type { AuditHandoffData } from "@/lib/storage/audit-handoff";
import type {
  MonthlyProjectionPoint,
  NightInterruptionIntensity,
  SimulatorInput,
  SimulatorOutput,
} from "../types";

export const INDONESIA_BENCHMARKS = {
  national_loss_trillion_idr: 463,
  presenteeism_loss_share: 0.885,
  max_individual_loss_idr: 11_000_000,
  max_lost_workdays_per_year: 34,
  max_performance_drop_pct: 51,
  work_days_per_year: 250,
} as const;

export const DEFAULT_SIMULATOR_INPUT: SimulatorInput = {
  team_size: 12,
  avg_monthly_salary_idr: 8_500_000,
  weekly_shadow_overtime_hours: 4.5,
  night_interruption_intensity: "MEDIUM",
};

export const INTENSITY_MULTIPLIERS: Record<NightInterruptionIntensity, number> = {
  LOW: 0.75,
  MEDIUM: 1.0,
  HIGH: 1.35,
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampFinite(
  value: number,
  min: number,
  max: number,
  fallback = 0
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number): number {
  return clampFinite(value, 0, 1, 0);
}

function isNightIntensity(value: unknown): value is NightInterruptionIntensity {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

function getMonthlyReductionRate(monthIndex: number): number {
  if (monthIndex === 1) return 0.25;
  if (monthIndex === 2) return 0.45;
  return 0.65;
}

export function sanitizeSimulatorInput(input: SimulatorInput): SimulatorInput {
  return {
    team_size: Math.round(clampFinite(input.team_size, 0, 10_000, 0)),
    avg_monthly_salary_idr: Math.round(
      clampFinite(input.avg_monthly_salary_idr, 0, 500_000_000, 0)
    ),
    weekly_shadow_overtime_hours: round1(
      clampFinite(input.weekly_shadow_overtime_hours, 0, 60, 0)
    ),
    night_interruption_intensity: isNightIntensity(
      input.night_interruption_intensity
    )
      ? input.night_interruption_intensity
      : "MEDIUM",
  };
}

export function calculatePresenteeismCost(
  rawInput: SimulatorInput
): SimulatorOutput {
  const sanitized = sanitizeSimulatorInput(rawInput);
  const multiplier =
    INTENSITY_MULTIPLIERS[sanitized.night_interruption_intensity];

  const exposure =
    sanitized.team_size === 0 || sanitized.weekly_shadow_overtime_hours === 0
      ? 0
      : clamp01((sanitized.weekly_shadow_overtime_hours / 12) * multiplier);

  const presenteeismRiskPct = round1(
    exposure * INDONESIA_BENCHMARKS.max_performance_drop_pct
  );

  const riskLevel: SimulatorOutput["risk_level"] =
    presenteeismRiskPct < 15
      ? "Rendah"
      : presenteeismRiskPct <= 30
        ? "Sedang"
        : "Tinggi";

  const lostWorkdaysPerPerson = round1(
    exposure * INDONESIA_BENCHMARKS.max_lost_workdays_per_year
  );
  const lostWorkdaysPerYear = Math.round(
    lostWorkdaysPerPerson * sanitized.team_size
  );

  const annualLossPerPerson =
    sanitized.avg_monthly_salary_idr *
    12 *
    (lostWorkdaysPerPerson / INDONESIA_BENCHMARKS.work_days_per_year) *
    INDONESIA_BENCHMARKS.presenteeism_loss_share;

  const annualLossIdr = Math.round(annualLossPerPerson * sanitized.team_size);
  const monthlyLossIdr = Math.round(annualLossIdr / 12);
  const benchmarkReferenceLossIdr = Math.round(
    sanitized.team_size *
      exposure *
      INDONESIA_BENCHMARKS.max_individual_loss_idr
  );

  const monthlyProjections: MonthlyProjectionPoint[] = [];
  const exactMonthlyBase = annualLossIdr / 12;
  let runningWithBatas = 0;

  for (let month = 1; month <= 12; month += 1) {
    const statusQuoCumulative = Math.round((annualLossIdr * month) / 12);
    const reductionRate = getMonthlyReductionRate(month);
    runningWithBatas += exactMonthlyBase * (1 - reductionRate);
    const withBatasCumulative = Math.min(
      statusQuoCumulative,
      Math.round(runningWithBatas)
    );
    monthlyProjections.push({
      month_index: month,
      month_label: `Bln ${month}`,
      status_quo_cumulative_idr: statusQuoCumulative,
      with_batasjam_cumulative_idr: withBatasCumulative,
      cumulative_savings_idr: Math.max(
        0,
        statusQuoCumulative - withBatasCumulative
      ),
    });
  }

  const lastMonth = monthlyProjections[11];
  const projectedAnnualSavingsIdr = lastMonth
    ? lastMonth.cumulative_savings_idr
    : 0;
  const savingsPercentage =
    annualLossIdr > 0
      ? round1((projectedAnnualSavingsIdr / annualLossIdr) * 100)
      : 0;

  return {
    sanitized_input: sanitized,
    exposure_index: round1(exposure * 100) / 100,
    presenteeism_risk_pct: presenteeismRiskPct,
    risk_level: riskLevel,
    lost_workdays_per_person_per_year: lostWorkdaysPerPerson,
    lost_workdays_per_year: lostWorkdaysPerYear,
    monthly_loss_idr: monthlyLossIdr,
    annual_loss_idr: annualLossIdr,
    benchmark_reference_loss_idr: benchmarkReferenceLossIdr,
    projected_annual_savings_idr: projectedAnnualSavingsIdr,
    savings_percentage: savingsPercentage,
    monthly_projections: monthlyProjections,
  };
}

export function mapHandoffToSimulatorInput(
  handoff: AuditHandoffData,
  current: SimulatorInput
): SimulatorInput {
  const safeHours = round1(
    clampFinite(handoff.avg_weekly_shadow_hours, 0, 60, current.weekly_shadow_overtime_hours)
  );
  const safePct = clampFinite(handoff.after_hours_percentage, 0, 100, 0);
  const intensity: NightInterruptionIntensity =
    safePct >= 30 ? "HIGH" : safePct >= 15 ? "MEDIUM" : "LOW";

  return sanitizeSimulatorInput({
    ...current,
    weekly_shadow_overtime_hours: safeHours,
    night_interruption_intensity: intensity,
  });
}

export function formatRupiah(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  const prefix = safe < 0 ? "-Rp" : "Rp";
  return `${prefix}${Math.abs(safe).toLocaleString("id-ID")}`;
}

export function formatRupiahCompact(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}Rp${(abs / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp${(abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${Math.round(abs / 1_000).toLocaleString("id-ID")} rb`;
  }
  return `${sign}Rp${Math.round(abs).toLocaleString("id-ID")}`;
}
