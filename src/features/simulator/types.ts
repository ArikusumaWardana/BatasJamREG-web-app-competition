export type NightInterruptionIntensity = "LOW" | "MEDIUM" | "HIGH";

export interface SimulatorInput {
  team_size: number;
  avg_monthly_salary_idr: number;
  weekly_shadow_overtime_hours: number;
  night_interruption_intensity: NightInterruptionIntensity;
}

export interface MonthlyProjectionPoint {
  month_index: number;
  month_label: string;
  status_quo_cumulative_idr: number;
  with_batasjam_cumulative_idr: number;
  cumulative_savings_idr: number;
}

export interface SimulatorOutput {
  sanitized_input: SimulatorInput;
  exposure_index: number;
  presenteeism_risk_pct: number;
  risk_level: "Rendah" | "Sedang" | "Tinggi";
  lost_workdays_per_person_per_year: number;
  lost_workdays_per_year: number;
  monthly_loss_idr: number;
  annual_loss_idr: number;
  benchmark_reference_loss_idr: number;
  projected_annual_savings_idr: number;
  savings_percentage: number;
  monthly_projections: MonthlyProjectionPoint[];
}
