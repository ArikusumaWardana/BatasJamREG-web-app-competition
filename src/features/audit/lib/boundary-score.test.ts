import { describe, expect, it } from "vitest";
import {
  calculateBoundaryScore,
  compareAuditSnapshots,
  type ComparableSnapshot,
} from "./boundary-score";

function buildSyntheticMatrix(workdayMsgs: number, weekendMsgs: number): number[][] {
  const matrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  matrix[0][10] = workdayMsgs;
  matrix[5][21] = Math.floor(weekendMsgs / 2);
  matrix[6][21] = weekendMsgs - Math.floor(weekendMsgs / 2);
  return matrix;
}

describe("boundary-score engine", () => {
  it("mengembalikan skor 100 Grade A tanpa NaN saat total pesan bernilai 0", () => {
    const res = calculateBoundaryScore({
      total_messages: 0,
      after_hours_messages: 0,
      false_urgency_count: 0,
    });

    expect(res.score).toBe(100);
    expect(res.grade).toBe("A");
    expect(res.status_label).toBe("Sangat Sehat");
    expect(res.tone).toBe("safe");
    expect(res.components).toHaveLength(3);
    expect(res.components.reduce((acc, item) => acc + item.weight_pct, 0)).toBe(100);
    expect(Number.isFinite(res.score)).toBe(true);
  });

  it("menghasilkan Grade A Sangat Sehat pada pola komunikasi sangat sehat", () => {
    const res = calculateBoundaryScore({
      total_messages: 1000,
      after_hours_messages: 50,
      false_urgency_count: 1,
      heatmap_matrix: buildSyntheticMatrix(990, 10),
      work_days: [1, 2, 3, 4, 5],
    });

    expect(res.after_hours_percentage).toBe(5);
    expect(res.non_workday_percentage).toBe(1);
    expect(res.score).toBeGreaterThanOrEqual(85);
    expect(res.grade).toBe("A");
    expect(res.tone).toBe("safe");
  });

  it("mengklasifikasikan kasus ekstrem 100% luar jam sebagai skor 0 Grade F Kritis", () => {
    const res = calculateBoundaryScore({
      total_messages: 200,
      after_hours_messages: 200,
      false_urgency_count: 100,
      non_workday_percentage: 60,
    });

    expect(res.score).toBe(0);
    expect(res.grade).toBe("F");
    expect(res.status_label).toBe("Kritis");
    expect(res.tone).toBe("danger");
  });

  it("memetakan ambang batas Grade B, C, dan D dengan benar", () => {
    const gradeB = calculateBoundaryScore({
      total_messages: 1000,
      after_hours_messages: 250,
      false_urgency_count: 12,
      non_workday_percentage: 5,
    });
    const gradeC = calculateBoundaryScore({
      total_messages: 1000,
      after_hours_messages: 350,
      false_urgency_count: 42,
      non_workday_percentage: 10,
    });
    const gradeD = calculateBoundaryScore({
      total_messages: 1000,
      after_hours_messages: 450,
      false_urgency_count: 81,
      non_workday_percentage: 15,
    });

    expect(gradeB.grade).toBe("B");
    expect(gradeB.tone).toBe("safe");
    expect(gradeC.grade).toBe("C");
    expect(gradeC.tone).toBe("warn");
    expect(gradeD.grade).toBe("D");
    expect(gradeD.tone).toBe("warn");
  });

  it("menghitung komponen non-workday dari matriks 7x24 sesuai work_days divisi", () => {
    const matrix = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    matrix[0][10] = 80;
    matrix[5][10] = 20;

    const fiveDays = calculateBoundaryScore({
      total_messages: 100,
      after_hours_messages: 20,
      false_urgency_count: 0,
      heatmap_matrix: matrix,
      work_days: [1, 2, 3, 4, 5],
    });
    const sixDays = calculateBoundaryScore({
      total_messages: 100,
      after_hours_messages: 0,
      false_urgency_count: 0,
      heatmap_matrix: matrix,
      work_days: [1, 2, 3, 4, 5, 6],
    });

    expect(fiveDays.non_workday_percentage).toBe(20);
    expect(sixDays.non_workday_percentage).toBe(0);
    expect(sixDays.score).toBeGreaterThan(fiveDays.score);
  });

  it("membandingkan snapshot before vs after yang membaik (September vs November)", () => {
    const sep: ComparableSnapshot = {
      id: "sep",
      label: "Audit September 2026",
      period_start: "2026-09-01",
      period_end: "2026-09-30",
      total_messages: 1720,
      after_hours_messages: 619,
      shadow_overtime_hours: 56,
      false_urgency_count: 48,
      heatmap_matrix: buildSyntheticMatrix(1540, 180),
    };
    const nov: ComparableSnapshot = {
      id: "nov",
      label: "Audit November 2026",
      period_start: "2026-11-01",
      period_end: "2026-11-22",
      total_messages: 1840,
      after_hours_messages: 497,
      shadow_overtime_hours: 42.5,
      false_urgency_count: 31,
      heatmap_matrix: buildSyntheticMatrix(1740, 100),
    };

    const comparison = compareAuditSnapshots(sep, nov, [1, 2, 3, 4, 5]);

    expect(comparison.score_delta).toBeGreaterThan(0);
    expect(comparison.shadow_hours_delta).toBe(-13.5);
    expect(comparison.shadow_hours_delta_pct).toBeCloseTo(-24.1, 1);
    expect(comparison.after_hours_pct_delta).toBeLessThan(0);
    expect(comparison.false_urgency_delta).toBe(-17);
    expect(comparison.improved_metrics_count).toBe(4);
  });

  it("menangani perbandingan memburuk dan baseline jam nol tanpa pembagian nol", () => {
    const beforeZero: ComparableSnapshot = {
      label: "Awal",
      period_start: "2026-09-01",
      period_end: "2026-09-15",
      total_messages: 500,
      after_hours_messages: 20,
      shadow_overtime_hours: 0,
      false_urgency_count: 2,
    };
    const afterWorse: ComparableSnapshot = {
      label: "Akhir",
      period_start: "2026-10-01",
      period_end: "2026-10-15",
      total_messages: 500,
      after_hours_messages: 220,
      shadow_overtime_hours: 28,
      false_urgency_count: 40,
    };

    const comparison = compareAuditSnapshots(beforeZero, afterWorse);

    expect(comparison.score_delta).toBeLessThan(0);
    expect(comparison.shadow_hours_delta).toBe(28);
    expect(comparison.shadow_hours_delta_pct).toBeNull();
    expect(comparison.false_urgency_delta).toBe(38);
    expect(comparison.improved_metrics_count).toBe(0);
  });
});
