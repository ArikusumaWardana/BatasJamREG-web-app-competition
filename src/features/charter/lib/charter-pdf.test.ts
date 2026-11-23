import { describe, expect, it } from "vitest";
import {
  buildCharterPdfDocument,
  sanitizeCharterFilename,
} from "./charter-pdf";

describe("sanitizeCharterFilename", () => {
  it("menghasilkan nama file PDF aman dengan slug dan versi", () => {
    expect(sanitizeCharterFilename("Tim Kreatif Nusantara!", 2)).toBe(
      "piagam-jam-digital-tim-kreatif-nusantara-v2.pdf"
    );
    expect(sanitizeCharterFilename("   ", 0)).toBe(
      "piagam-jam-digital-tim-v1.pdf"
    );
  });
});

describe("buildCharterPdfDocument", () => {
  it("menghasilkan dokumen PDF valid beserta tabel kriteria darurat", () => {
    const doc = buildCharterPdfDocument({
      title: "Piagam Jam Digital Tim Kreatif Nusantara",
      company_or_team_name: "Tim Kreatif Nusantara",
      quiet_hours_start: "18:00:00",
      quiet_hours_end: "08:00:00",
      non_urgent_sla_hours: 2,
      emergency_criteria: [
        "Server produksi mengalami downtime HTTP 5xx",
        "Insiden keamanan akun atau kebocoran data klien",
      ],
      baseline_shadow_hours: 42.5,
      version: 3,
      effective_date: "2026-11-23T00:00:00.000Z",
    });

    const rawPdf = doc.output("arraybuffer");
    const header = new TextDecoder().decode(new Uint8Array(rawPdf).slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(rawPdf.byteLength).toBeGreaterThan(2000);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("tetap berhasil merender PDF saat baseline shadow hours null", () => {
    const doc = buildCharterPdfDocument({
      title: "Kesepakatan Komunikasi Produk",
      company_or_team_name: "Skuad Produk",
      quiet_hours_start: "17:30",
      quiet_hours_end: "08:30",
      non_urgent_sla_hours: 4,
      emergency_criteria: ["Layanan pembayaran gagal untuk seluruh pengguna"],
      baseline_shadow_hours: null,
    });

    const rawPdf = doc.output("arraybuffer");
    const header = new TextDecoder().decode(new Uint8Array(rawPdf).slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(rawPdf.byteLength).toBeGreaterThan(1500);
  });

  it("melampirkan halaman tabel persetujuan digital jika acknowledgements tersedia", () => {
    const doc = buildCharterPdfDocument({
      title: "Piagam Jam Digital Tim Kreatif",
      company_or_team_name: "Tim Kreatif Nusantara",
      quiet_hours_start: "18:00:00",
      quiet_hours_end: "08:00:00",
      non_urgent_sla_hours: 2,
      emergency_criteria: ["Server produksi mengalami downtime"],
      baseline_shadow_hours: 42.5,
      version: 2,
      acknowledgements: [
        {
          id: "ack-1",
          user_id: "u-1",
          full_name: "Sinta Dewi",
          role_title: "Team Lead",
          signed_at: "2026-11-22T09:15:00.000Z",
        },
        {
          id: "ack-2",
          user_id: "u-2",
          full_name: "Nadya Putri",
          role_title: "Desainer Kreatif",
          signed_at: "2026-11-22T10:30:00.000Z",
        },
      ],
    });

    const rawPdf = doc.output("arraybuffer");
    const header = new TextDecoder().decode(new Uint8Array(rawPdf).slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });
});
