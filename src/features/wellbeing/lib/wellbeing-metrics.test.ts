import { describe, expect, it } from "vitest";
import {
  computeCharterAdoptionPercentage,
  computeWellbeingCompositeScore,
  getCurrentWeekStartDate,
  mapWellbeingSummaryRow,
  summarizeEmergencyAudit,
} from "./wellbeing-metrics";

describe("wellbeing-metrics", () => {
  it("menghitung tanggal Senin awal minggu sesuai zona waktu Indonesia", () => {
    // 2026-11-23 adalah hari Senin di WIB; pukul 18:00 UTC Minggu 22 Nov sudah Senin di WIB
    const sundayUtcLate = new Date("2026-11-22T18:00:00.000Z");
    expect(getCurrentWeekStartDate("Asia/Jakarta", sundayUtcLate)).toBe(
      "2026-11-23"
    );

    const wednesday = new Date("2026-11-25T10:00:00.000Z");
    expect(getCurrentWeekStartDate("Asia/Jakarta", wednesday)).toBe(
      "2026-11-23"
    );
  });

  it("menjaga K-Anonymity dengan menyembunyikan skor bila responden kurang dari 3", () => {
    const masked = mapWellbeingSummaryRow({
      week_start_date: "2026-11-23",
      response_count: 2,
      is_threshold_met: false,
      avg_rest_quality: 4.5,
      avg_reply_pressure: 2.0,
      avg_boundary_clarity: 4.0,
    });

    expect(masked.is_threshold_met).toBe(false);
    expect(masked.avg_rest_quality).toBeNull();
    expect(masked.avg_reply_pressure).toBeNull();
    expect(masked.avg_boundary_clarity).toBeNull();
    expect(masked.composite_score).toBeNull();
  });

  it("menghitung skor komposit dengan inversi reply_pressure saat threshold >= 3 terpenuhi", () => {
    const summary = mapWellbeingSummaryRow({
      week_start_date: "2026-11-23",
      response_count: 3,
      is_threshold_met: true,
      avg_rest_quality: 4.0,
      avg_reply_pressure: 2.0,
      avg_boundary_clarity: 4.0,
    });

    expect(summary.is_threshold_met).toBe(true);
    expect(summary.composite_score).toBe(4.0);
    expect(computeWellbeingCompositeScore(null, 2, 4)).toBeNull();
  });

  it("merangkum rasio Darurat Valid vs Seharusnya Antrean Pagi serta adopsi piagam", () => {
    const audit = summarizeEmergencyAudit([
      { emergency_review_status: "VALID_EMERGENCY" },
      { emergency_review_status: "VALID_EMERGENCY" },
      { emergency_review_status: "SHOULD_BE_QUEUED" },
      { emergency_review_status: "PENDING" },
    ]);

    expect(audit).toEqual({
      total_emergency: 4,
      valid_count: 2,
      false_alarm_count: 1,
      pending_count: 1,
      valid_ratio_pct: 67,
    });

    expect(summarizeEmergencyAudit([{ emergency_review_status: "PENDING" }]).valid_ratio_pct).toBeNull();
    expect(computeCharterAdoptionPercentage(2, 3)).toBe(67);
    expect(computeCharterAdoptionPercentage(0, 0)).toBe(0);
  });
});
