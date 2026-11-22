import { describe, expect, it } from "vitest";
import {
  CORE_MODULES,
  HERO_PREVIEW_METRICS,
  INDONESIA_CRISIS_STATS,
  PRIVACY_ZONES,
  SDG_MAPPING_POINTS,
} from "./landing-content";

describe("landing-content", () => {
  it("memenuhi koreksi wajib DESIGN.md untuk hero 90 hari dan deskripsi Morning Digest", () => {
    expect(HERO_PREVIEW_METRICS.period_label).toBe("Periode: 90 Hari Terakhir");
    expect(HERO_PREVIEW_METRICS.shadow_overtime_label).toBe("42,5 Jam");
    expect(HERO_PREVIEW_METRICS.mini_heatmap).toHaveLength(7);

    const digestModule = CORE_MODULES.find((item) => item.id === "digest");
    expect(digestModule).toBeDefined();
    expect(digestModule?.description).toBe(
      "Tahan instruksi non-darurat yang muncul di malam hari agar dirangkum rapi dan siap dikirim pukul 08.30 WIB esok pagi."
    );
  });

  it("memuat jumlah kartu, rute valid, dan bebas em-dash di seluruh teks landing", () => {
    expect(INDONESIA_CRISIS_STATS).toHaveLength(4);
    expect(PRIVACY_ZONES).toHaveLength(2);
    expect(CORE_MODULES).toHaveLength(4);
    expect(SDG_MAPPING_POINTS).toHaveLength(3);

    expect(CORE_MODULES.map((item) => item.href)).toEqual([
      "/audit",
      "/workspace/digest",
      "/charter",
      "/simulator",
    ]);

    const serialized = JSON.stringify({
      HERO_PREVIEW_METRICS,
      INDONESIA_CRISIS_STATS,
      PRIVACY_ZONES,
      CORE_MODULES,
      SDG_MAPPING_POINTS,
    });
    expect(serialized).not.toContain("\u2014");
  });
});
