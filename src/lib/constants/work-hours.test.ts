import { describe, expect, it } from "vitest";
import { getWorkHoursStatus, WORK_PATTERNS } from "./work-hours";

describe("getWorkHoursStatus", () => {
  const defaultConfig = {
    work_start_time: WORK_PATTERNS.FIVE_DAYS_8H.startTime,
    work_end_time: WORK_PATTERNS.FIVE_DAYS_8H.endTime,
    digest_dispatch_time: "08:30:00",
    timezone: "Asia/Jakarta" as const,
    work_days: WORK_PATTERNS.FIVE_DAYS_8H.workDays,
  };

  it("mendeteksi jam reguler pada Senin 10:00 WIB", () => {
    const monday10Wib = new Date("2026-11-23T03:00:00.000Z");
    const status = getWorkHoursStatus(defaultConfig, monday10Wib);

    expect(status.isRegularHours).toBe(true);
    expect(status.isWorkDay).toBe(true);
    expect(status.isoWeekday).toBe(1);
    expect(status.timezoneLabel).toBe("WIB");
    expect(status.currentTimeLabel).toBe("10:00");
  });

  it("mendeteksi luar jam reguler pada Senin malam 21:30 WIB", () => {
    const monday2130Wib = new Date("2026-11-23T14:30:00.000Z");
    const status = getWorkHoursStatus(defaultConfig, monday2130Wib);

    expect(status.isRegularHours).toBe(false);
    expect(status.isWorkDay).toBe(true);
    expect(status.nextDigestLabel).toBe("Besok, 08:30 WIB");
    expect(status.nextDigestCountdown).toBe("11 jam lagi");
  });

  it("menjadwalkan digest hari ini jika masih pagi sebelum jadwal kirim", () => {
    const monday0730Wib = new Date("2026-11-23T00:30:00.000Z");
    const status = getWorkHoursStatus(defaultConfig, monday0730Wib);

    expect(status.isRegularHours).toBe(false);
    expect(status.nextDigestLabel).toBe("Hari ini, 08:30 WIB");
    expect(status.nextDigestCountdown).toBe("1 jam lagi");
  });

  it("membedakan Sabtu antara pola 5 hari dan pola 6 hari UU 13/2003", () => {
    const saturday10Wib = new Date("2026-11-21T03:00:00.000Z");
    const fiveDays = getWorkHoursStatus(defaultConfig, saturday10Wib);
    const sixDays = getWorkHoursStatus(
      {
        work_start_time: WORK_PATTERNS.SIX_DAYS_7H.startTime,
        work_end_time: WORK_PATTERNS.SIX_DAYS_7H.endTime,
        digest_dispatch_time: "08:30:00",
        timezone: "Asia/Jakarta",
        work_days: WORK_PATTERNS.SIX_DAYS_7H.workDays,
      },
      saturday10Wib
    );

    expect(fiveDays.isRegularHours).toBe(false);
    expect(fiveDays.isWorkDay).toBe(false);
    expect(fiveDays.nextDigestLabel).toBe("Senin, 08:30 WIB");

    expect(sixDays.isRegularHours).toBe(true);
    expect(sixDays.isWorkDay).toBe(true);
  });

  it("mengonversi zona waktu WITA (Asia/Makassar) dengan akurat", () => {
    const utc0130 = new Date("2026-11-23T01:30:00.000Z");
    const status = getWorkHoursStatus(
      { ...defaultConfig, timezone: "Asia/Makassar" },
      utc0130
    );

    expect(status.timezoneLabel).toBe("WITA");
    expect(status.currentTimeLabel).toBe("09:30");
    expect(status.isRegularHours).toBe(true);
  });
});
