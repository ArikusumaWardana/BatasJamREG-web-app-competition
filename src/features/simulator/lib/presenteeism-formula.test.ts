import { describe, expect, it } from "vitest";
import {
  calculatePresenteeismCost,
  DEFAULT_SIMULATOR_INPUT,
  formatRupiah,
  formatRupiahCompact,
  INDONESIA_BENCHMARKS,
  mapHandoffToSimulatorInput,
  sanitizeSimulatorInput,
} from "./presenteeism-formula";

describe("presenteeism-formula", () => {
  it("menghitung metrik default secara realistis dan menghasilkan 12 bulan proyeksi", () => {
    const result = calculatePresenteeismCost(DEFAULT_SIMULATOR_INPUT);

    expect(result.presenteeism_risk_pct).toBeGreaterThan(0);
    expect(result.presenteeism_risk_pct).toBeLessThanOrEqual(
      INDONESIA_BENCHMARKS.max_performance_drop_pct
    );
    expect(result.lost_workdays_per_person_per_year).toBeGreaterThan(0);
    expect(result.lost_workdays_per_person_per_year).toBeLessThanOrEqual(
      INDONESIA_BENCHMARKS.max_lost_workdays_per_year
    );
    expect(result.annual_loss_idr).toBeGreaterThan(10_000_000);
    expect(result.monthly_loss_idr).toBe(Math.round(result.annual_loss_idr / 12));
    expect(result.monthly_projections).toHaveLength(12);
    expect(result.monthly_projections[11]?.status_quo_cumulative_idr).toBe(
      result.annual_loss_idr
    );
    expect(result.projected_annual_savings_idr).toBeGreaterThan(0);
    expect(result.savings_percentage).toBeGreaterThan(40);
  });

  it("menaikkan estimasi kerugian seiring meningkatnya intensitas interupsi malam", () => {
    const low = calculatePresenteeismCost({
      ...DEFAULT_SIMULATOR_INPUT,
      night_interruption_intensity: "LOW",
    });
    const medium = calculatePresenteeismCost({
      ...DEFAULT_SIMULATOR_INPUT,
      night_interruption_intensity: "MEDIUM",
    });
    const high = calculatePresenteeismCost({
      ...DEFAULT_SIMULATOR_INPUT,
      night_interruption_intensity: "HIGH",
    });

    expect(low.annual_loss_idr).toBeLessThan(medium.annual_loss_idr);
    expect(medium.annual_loss_idr).toBeLessThan(high.annual_loss_idr);
  });

  it("menahan ceiling benchmark saat jam lembur sangat ekstrem", () => {
    const extreme = calculatePresenteeismCost({
      team_size: 5000,
      avg_monthly_salary_idr: 50_000_000,
      weekly_shadow_overtime_hours: 60,
      night_interruption_intensity: "HIGH",
    });

    expect(extreme.presenteeism_risk_pct).toBe(51);
    expect(extreme.lost_workdays_per_person_per_year).toBe(34);
    expect(extreme.risk_level).toBe("Tinggi");
    expect(Number.isFinite(extreme.annual_loss_idr)).toBe(true);
    expect(Number.isFinite(extreme.projected_annual_savings_idr)).toBe(true);
  });

  it("mengamankan input nol, negatif, NaN, dan Infinity tanpa menghasilkan NaN/Infinity", () => {
    const zeroTeam = calculatePresenteeismCost({
      team_size: 0,
      avg_monthly_salary_idr: 10_000_000,
      weekly_shadow_overtime_hours: 8,
      night_interruption_intensity: "HIGH",
    });
    expect(zeroTeam.annual_loss_idr).toBe(0);
    expect(zeroTeam.presenteeism_risk_pct).toBe(0);
    expect(zeroTeam.savings_percentage).toBe(0);

    const malformed = calculatePresenteeismCost({
      team_size: Number.NaN,
      avg_monthly_salary_idr: Number.POSITIVE_INFINITY,
      weekly_shadow_overtime_hours: -50,
      night_interruption_intensity: "MEDIUM",
    });

    expect(Number.isNaN(malformed.annual_loss_idr)).toBe(false);
    expect(Number.isFinite(malformed.annual_loss_idr)).toBe(true);
    expect(malformed.sanitized_input.weekly_shadow_overtime_hours).toBe(0);
    expect(sanitizeSimulatorInput({
      team_size: -5,
      avg_monthly_salary_idr: -100,
      weekly_shadow_overtime_hours: Number.NaN,
      night_interruption_intensity: "LOW",
    })).toEqual({
      team_size: 0,
      avg_monthly_salary_idr: 0,
      weekly_shadow_overtime_hours: 0,
      night_interruption_intensity: "LOW",
    });
  });

  it("memetakan handoff Audit WA dan memformat Rupiah dengan benar", () => {
    const mapped = mapHandoffToSimulatorInput(
      {
        avg_weekly_shadow_hours: 5.44,
        shadow_overtime_hours: 42.5,
        after_hours_percentage: 32,
        work_start_time: "09:00:00",
        work_end_time: "17:00:00",
        peak_day_of_week: 2,
        peak_hour: 21,
        source_label: "Dataset Simulasi 90 Hari",
        saved_at: "2026-11-23T00:00:00.000Z",
      },
      DEFAULT_SIMULATOR_INPUT
    );

    expect(mapped.weekly_shadow_overtime_hours).toBe(5.4);
    expect(mapped.night_interruption_intensity).toBe("HIGH");
    expect(mapped.team_size).toBe(DEFAULT_SIMULATOR_INPUT.team_size);

    expect(formatRupiah(8_500_000)).toBe("Rp8.500.000");
    expect(formatRupiah(Number.NaN)).toBe("Rp0");
    expect(formatRupiahCompact(1_500_000_000)).toContain("M");
    expect(formatRupiahCompact(55_400_000)).toContain("jt");
    expect(formatRupiahCompact(500)).toBe("Rp500");
  });
});
