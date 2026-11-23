import { describe, expect, it } from "vitest";
import {
  createAuditSnapshotSchema,
  createDigestCardSchema,
  createOrganizationSchema,
  createWorkspaceSchema,
  diplomaticReplySchema,
  emergencyReviewSchema,
  joinWorkspaceSchema,
  updateWorkspaceMemberRoleSchema,
  wellbeingPulseSchema,
} from "./index";

function makeValidHeatmap(): number[][] {
  return Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 1)
  );
}

describe("Zod validation schemas", () => {
  it("menerima payload audit snapshot anonim valid dengan matriks 7x24", () => {
    const result = createAuditSnapshotSchema.safeParse({
      label: "Audit Q4 Tim Kreatif",
      period_start: "2026-09-01",
      period_end: "2026-11-22",
      total_messages: 1840,
      after_hours_messages: 497,
      shadow_overtime_hours: 42.5,
      false_urgency_count: 31,
      peak_day_of_week: 2,
      peak_hour: 21,
      heatmap_matrix: makeValidHeatmap(),
    });

    expect(result.success).toBe(true);
  });

  it("menolak properti asing berisi teks chat mentah pada audit snapshot (.strict)", () => {
    const result = createAuditSnapshotSchema.safeParse({
      label: "Audit Terlarang",
      period_start: "2026-09-01",
      period_end: "2026-11-22",
      total_messages: 100,
      after_hours_messages: 20,
      shadow_overtime_hours: 4.5,
      false_urgency_count: 2,
      peak_day_of_week: 2,
      peak_hour: 21,
      heatmap_matrix: makeValidHeatmap(),
      messages: ["raw chat text"],
      raw_text: "tidak boleh masuk",
    });

    expect(result.success).toBe(false);
  });

  it("menolak audit snapshot jika after_hours_messages melebihi total_messages", () => {
    const result = createAuditSnapshotSchema.safeParse({
      label: "Audit Tidak Konsisten",
      period_start: "2026-09-01",
      period_end: "2026-11-22",
      total_messages: 50,
      after_hours_messages: 60,
      shadow_overtime_hours: 5,
      false_urgency_count: 1,
      peak_day_of_week: 2,
      peak_hour: 21,
      heatmap_matrix: makeValidHeatmap(),
    });

    expect(result.success).toBe(false);
  });

  it("mewajibkan emergency_reason minimal 10 karakter saat triage_type EMERGENCY_OPS", () => {
    const invalid = createDigestCardSchema.safeParse({
      title: "Server down produksi",
      body: "Perlu cek segera layanan utama.",
      triage_type: "EMERGENCY_OPS",
      emergency_reason: "Mendesak",
    });
    expect(invalid.success).toBe(false);

    const valid = createDigestCardSchema.safeParse({
      title: "Server down produksi",
      body: "Perlu cek segera layanan utama.",
      triage_type: "EMERGENCY_OPS",
      emergency_reason: "Layanan pembayaran utama gagal memproses transaksi.",
    });
    expect(valid.success).toBe(true);
  });

  it("mengizinkan MORNING_QUEUE tanpa emergency_reason", () => {
    const result = createDigestCardSchema.safeParse({
      title: "Revisi copywriting halaman utama",
      body: "Mohon sesuaikan bagian FAQ sebelum rapat pagi besok.",
      triage_type: "MORNING_QUEUE",
    });

    expect(result.success).toBe(true);
  });

  it("menolak workspace baru jika jam selesai lebih kecil atau sama dengan jam mulai", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "Tim Desain",
      work_pattern: "CUSTOM",
      work_start_time: "17:00",
      work_end_time: "09:00",
      digest_dispatch_time: "08:30",
      timezone: "Asia/Jakarta",
      work_days: [1, 2, 3, 4, 5],
    });

    expect(result.success).toBe(false);
  });

  it("menormalkan format waktu HH:MM ke HH:MM:00 dan invite_code ke huruf kapital", () => {
    const ws = createWorkspaceSchema.parse({
      name: "Divisi Produk",
      work_start_time: "08:30",
      work_end_time: "16:30",
      digest_dispatch_time: "08:00",
    });
    const join = joinWorkspaceSchema.parse({ invite_code: " reg-8492 " });

    expect(ws.work_start_time).toBe("08:30:00");
    expect(join.invite_code).toBe("REG-8492");
  });

  it("memvalidasi panjang short_context pada payload diplomatic reply", () => {
    const tooLong = diplomaticReplySchema.safeParse({
      recipient: "MANAGER",
      time_context: "NIGHT",
      tone: "POLITE_STARTUP",
      short_context: "a".repeat(201),
      next_work_window: "Besok pukul 09.00 WIB",
    });
    expect(tooLong.success).toBe(false);

    const valid = diplomaticReplySchema.safeParse({
      recipient: "CLIENT",
      time_context: "WEEKEND",
      tone: "FIRM_PROFESSIONAL",
      short_context: "Diminta revisi proposal kampanye akhir pekan",
      next_work_window: "Senin pukul 09.00 WIB",
    });
    expect(valid.success).toBe(true);
  });

  it("memvalidasi pembuatan organisasi dan larangan mengubah role menjadi OWNER secara langsung", () => {
    const validOrg = createOrganizationSchema.safeParse({
      name: "PT Nusantara Digital",
      initial_workspace_name: "Tim Operasional",
      work_start_time: "09:00",
      work_end_time: "17:00",
    });
    expect(validOrg.success).toBe(true);

    const invalidHoursOrg = createOrganizationSchema.safeParse({
      name: "PT Nusantara Digital",
      initial_workspace_name: "Tim Operasional",
      work_start_time: "18:00",
      work_end_time: "09:00",
    });
    expect(invalidHoursOrg.success).toBe(false);

    expect(
      updateWorkspaceMemberRoleSchema.safeParse({ role: "LEAD" }).success
    ).toBe(true);
    expect(
      updateWorkspaceMemberRoleSchema.safeParse({ role: "MEMBER" }).success
    ).toBe(true);
    expect(
      updateWorkspaceMemberRoleSchema.safeParse({ role: "OWNER" }).success
    ).toBe(false);
  });

  it("memvalidasi rentang skor 1..5 wellbeing pulse dan status review darurat", () => {
    expect(
      wellbeingPulseSchema.safeParse({
        rest_quality: 4,
        reply_pressure: 2,
        boundary_clarity: 5,
      }).success
    ).toBe(true);

    expect(
      wellbeingPulseSchema.safeParse({
        rest_quality: 6,
        reply_pressure: 2,
        boundary_clarity: 3,
      }).success
    ).toBe(false);

    expect(
      emergencyReviewSchema.safeParse({
        emergency_review_status: "VALID_EMERGENCY",
      }).success
    ).toBe(true);

    expect(
      emergencyReviewSchema.safeParse({
        emergency_review_status: "PENDING",
      }).success
    ).toBe(false);
  });
});
