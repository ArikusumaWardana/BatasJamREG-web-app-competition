import { describe, expect, it } from "vitest";
import {
  buildPublicStatusUrl,
  formatWorkDaysLabel,
  generateWhatsAppBioVariants,
} from "./wa-bio-generator";

describe("wa-bio-generator", () => {
  it("menghasilkan 3 variasi bio WhatsApp lengkap dengan jam reguler, zona waktu, digest, dan tautan", () => {
    const variants = generateWhatsAppBioVariants({
      workspace_name: "Tim Kreatif Nusantara",
      slug: "tim-kreatif-nusantara",
      work_start_time: "09:00:00",
      work_end_time: "17:00:00",
      digest_dispatch_time: "08:30:00",
      timezone: "Asia/Jakarta",
      work_days: [1, 2, 3, 4, 5],
      origin: "https://batasjamreg.vercel.app",
    });

    expect(variants).toHaveLength(3);
    for (const variant of variants) {
      expect(variant.text).toContain("09:00-17:00 WIB");
      expect(variant.text).toContain("08:30 WIB");
      expect(variant.text).toContain(
        "https://batasjamreg.vercel.app/status/tim-kreatif-nusantara"
      );
      expect(variant.char_count).toBe(variant.text.length);
      expect(variant.char_count).toBeLessThanOrEqual(220);
      expect(variant.text).not.toContain("\u2014");
    }
  });

  it("memformat label hari kerja untuk pola 5 hari, 6 hari, dan jadwal kustom", () => {
    expect(formatWorkDaysLabel([1, 2, 3, 4, 5], "short")).toBe("Sen-Jum");
    expect(formatWorkDaysLabel([1, 2, 3, 4, 5], "full")).toBe("Senin - Jumat");
    expect(formatWorkDaysLabel([1, 2, 3, 4, 5, 6], "short")).toBe("Sen-Sab");
    expect(formatWorkDaysLabel([1, 2, 3, 4, 5, 6], "full")).toBe(
      "Senin - Sabtu"
    );
    expect(formatWorkDaysLabel([1, 3, 5], "short")).toBe("Sen, Rab, Jum");
  });

  it("menangani origin kosong dan trailing slash dengan aman", () => {
    expect(buildPublicStatusUrl("tim-engineering")).toBe("/status/tim-engineering");
    expect(
      buildPublicStatusUrl("/tim-engineering", "https://batasjamreg.id///")
    ).toBe("https://batasjamreg.id/status/tim-engineering");
  });

  it("mendukung zona waktu WITA dan WIT pada teks bio", () => {
    const variants = generateWhatsAppBioVariants({
      workspace_name: "Divisi Bali",
      slug: "divisi-bali",
      work_start_time: "08:30:00",
      work_end_time: "16:30:00",
      digest_dispatch_time: "08:00:00",
      timezone: "Asia/Makassar",
      work_days: [1, 2, 3, 4, 5, 6],
    });

    expect(variants[0]?.text).toContain("Sen-Sab 08:30-16:30 WITA");
    expect(variants[1]?.text).toContain("08:00 WITA");
    expect(variants[2]?.text).toContain("/status/divisi-bali");
  });
});
