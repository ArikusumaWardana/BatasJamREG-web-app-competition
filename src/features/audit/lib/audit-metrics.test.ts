import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WORK_PATTERNS } from "@/lib/constants/work-hours";
import { createAuditSnapshotSchema } from "@/lib/validations";
import type { AuditConfig } from "../types";
import {
  buildSnapshotPayload,
  parseWaTextAndAnalyze,
} from "./audit-metrics";
import {
  DEFAULT_FALSE_URGENCY_KEYWORDS,
  matchFalseUrgencyKeywords,
} from "./false-urgency";

const FIVE_DAYS_CONFIG: AuditConfig = {
  work_pattern: "FIVE_DAYS_8H",
  work_start_time: WORK_PATTERNS.FIVE_DAYS_8H.startTime,
  work_end_time: WORK_PATTERNS.FIVE_DAYS_8H.endTime,
  timezone: "Asia/Jakarta",
  work_days: WORK_PATTERNS.FIVE_DAYS_8H.workDays,
  keywords: DEFAULT_FALSE_URGENCY_KEYWORDS,
};

describe("false-urgency detector", () => {
  it("mendeteksi kata kunci secara case-insensitive termasuk keyword kustom", () => {
    const matches = matchFalseUrgencyKeywords(
      "Tolong asap cek SEBENTAR ya, ada update penting.",
      [...DEFAULT_FALSE_URGENCY_KEYWORDS, "update penting"]
    );

    expect(matches).toContain("ASAP");
    expect(matches).toContain("cek sebentar");
    expect(matches).toContain("update penting");
  });
});

describe("audit-metrics engine", () => {
  it("mem-parse format ekspor Android ID dan iOS dengan akurat", () => {
    const androidLog = [
      "23/11/26, 09.15 - Raka: Pagi tim, mulai standup.",
      "23/11/26, 21.10 - Dina: Tolong cek sebentar slide 2.",
    ].join("\n");
    const iosLog = [
      "[23/11/26, 10.05.12] Raka: File sudah siap.",
      "[23/11/26, 22.00.00] Dina: Revisi besok pagi ya.",
    ].join("\n");

    const androidRes = parseWaTextAndAnalyze(
      androidLog,
      FIVE_DAYS_CONFIG,
      "android.txt"
    );
    const iosRes = parseWaTextAndAnalyze(iosLog, FIVE_DAYS_CONFIG, "ios.txt");

    expect(androidRes.total_messages).toBe(2);
    expect(androidRes.regular_messages).toBe(1);
    expect(androidRes.after_hours_messages).toBe(1);

    expect(iosRes.total_messages).toBe(2);
    expect(iosRes.regular_messages).toBe(1);
    expect(iosRes.after_hours_messages).toBe(1);
  });

  it("mendukung pesan multi-baris dan menangkap false urgency pada baris lanjutan", () => {
    const log = [
      "23/11/26, 20.30 - Raka: Daftar tugas malam:",
      "- Ganti gambar banner",
      "- Tolong cepat dikirim ASAP sebelum besok",
      "23/11/26, 11.00 - Dina: Siap, sudah dicatat.",
    ].join("\n");

    const res = parseWaTextAndAnalyze(log, FIVE_DAYS_CONFIG, "multiline.txt");

    expect(res.total_messages).toBe(2);
    expect(res.false_urgency_count).toBe(2);
    expect(res.false_urgency_breakdown.map((item) => item.keyword)).toEqual(
      expect.arrayContaining(["ASAP", "tolong cepat"])
    );
  });

  it("mengklasifikasikan pesan lintas tengah malam (23:55 dan 00:15) sebagai luar jam reguler", () => {
    const log = [
      "23/11/26, 23.55 - Raka: Masih ada koreksi minor.",
      "24/11/26, 00.15 - Dina: Baik, saya cek segera.",
    ].join("\n");

    const res = parseWaTextAndAnalyze(log, FIVE_DAYS_CONFIG, "midnight.txt");

    expect(res.total_messages).toBe(2);
    expect(res.after_hours_messages).toBe(2);
    expect(res.after_hours_percentage).toBe(100);
    expect(res.shadow_overtime_hours).toBeGreaterThan(0);
  });

  it("membedakan hari Sabtu pada pola 5 hari kerja vs 6 hari kerja UU 13/2003", () => {
    const saturdayLog = [
      "21/11/26, 10.30 - Raka: Sinkronisasi mingguan.",
      "21/11/26, 14.00 - Dina: Laporan selesai.",
    ].join("\n");

    const fiveDays = parseWaTextAndAnalyze(
      saturdayLog,
      FIVE_DAYS_CONFIG,
      "sabtu5.txt"
    );
    const sixDays = parseWaTextAndAnalyze(
      saturdayLog,
      {
        ...FIVE_DAYS_CONFIG,
        work_pattern: "SIX_DAYS_7H",
        work_end_time: WORK_PATTERNS.SIX_DAYS_7H.endTime,
        work_days: WORK_PATTERNS.SIX_DAYS_7H.workDays,
      },
      "sabtu6.txt"
    );

    expect(fiveDays.after_hours_messages).toBe(2);
    expect(sixDays.regular_messages).toBe(2);
    expect(sixDays.after_hours_messages).toBe(0);
  });

  it("mematuhi batas tepat jam reguler (09:00 reguler, 16:59 reguler, 17:00 luar jam)", () => {
    const boundaryLog = [
      "23/11/26, 09.00 - Raka: Mulai kerja.",
      "23/11/26, 16.59 - Dina: Menit terakhir jam kerja.",
      "23/11/26, 17.00 - Bima: Sudah masuk jam pulang.",
    ].join("\n");

    const res = parseWaTextAndAnalyze(
      boundaryLog,
      FIVE_DAYS_CONFIG,
      "boundary.txt"
    );

    expect(res.regular_messages).toBe(2);
    expect(res.after_hours_messages).toBe(1);
  });

  it("mengabaikan pesan sistem WhatsApp tanpa pengirim", () => {
    const log = [
      "23/11/26, 08.50 - Pesan dan panggilan terenkripsi secara end-to-end.",
      "23/11/26, 09.10 - Raka: Selamat pagi.",
    ].join("\n");

    const res = parseWaTextAndAnalyze(log, FIVE_DAYS_CONFIG, "system.txt");
    expect(res.total_messages).toBe(1);
  });

  it("menghasilkan matriks heatmap 7x24 dan payload snapshot yang lolos validasi ketat", () => {
    const log = [
      "24/11/26, 10.00 - Raka: Update pagi.",
      "24/11/26, 21.15 - Dina: Cek sebentar file ini.",
      "24/11/26, 21.25 - Raka: Siap, segera saya lihat.",
    ].join("\n");

    const res = parseWaTextAndAnalyze(log, FIVE_DAYS_CONFIG, "selasa.txt");
    expect(res.heatmap_matrix).toHaveLength(7);
    for (const row of res.heatmap_matrix) {
      expect(row).toHaveLength(24);
    }
    expect(res.peak_day_of_week).toBe(2);
    expect(res.peak_hour).toBe(21);

    const payload = buildSnapshotPayload(res, "Audit Mingguan Selasa");
    const validation = createAuditSnapshotSchema.safeParse(payload);
    expect(validation.success).toBe(true);
  });

  it("menganalisis dataset simulasi 90 hari asli dengan puncak Selasa pukul 21:00", () => {
    const demoPath = path.resolve(
      process.cwd(),
      "public",
      "demo",
      "agency-90d-wa.txt"
    );
    const content = fs.readFileSync(demoPath, "utf8");
    const res = parseWaTextAndAnalyze(
      content,
      FIVE_DAYS_CONFIG,
      "agency-90d-wa.txt"
    );

    expect(res.total_messages).toBeGreaterThan(1000);
    expect(res.after_hours_messages).toBeGreaterThan(200);
    expect(res.peak_day_of_week).toBe(2);
    expect(res.peak_hour).toBe(21);
    expect(res.false_urgency_count).toBeGreaterThan(0);
    expect(res.weekly_trend.length).toBeGreaterThanOrEqual(12);
    expect(
      createAuditSnapshotSchema.safeParse(
        buildSnapshotPayload(res, "Simulasi 90 Hari")
      ).success
    ).toBe(true);
  });

  it("menangani teks kosong secara aman tanpa menghasilkan NaN atau matriks rusak", () => {
    const res = parseWaTextAndAnalyze("", FIVE_DAYS_CONFIG, "empty.txt");
    expect(res.total_messages).toBe(0);
    expect(res.shadow_overtime_hours).toBe(0);
    expect(res.after_hours_percentage).toBe(0);
    expect(res.peak_day_of_week).toBe(1);
    expect(res.peak_hour).toBe(0);
    expect(
      createAuditSnapshotSchema.safeParse(
        buildSnapshotPayload(res, "Audit Kosong")
      ).success
    ).toBe(true);
  });
});
