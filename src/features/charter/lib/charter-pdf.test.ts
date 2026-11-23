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

  it("melampirkan halaman tabel persetujuan digital dan stempel tanda tangan halaman 1 jika acknowledgements tersedia", () => {
    const doc = buildCharterPdfDocument({
      title: "Piagam Jam Digital Tim Kreatif",
      company_or_team_name: "Tim Kreatif Nusantara",
      quiet_hours_start: "18:00:00",
      quiet_hours_end: "08:00:00",
      non_urgent_sla_hours: 2,
      emergency_criteria: ["Server produksi mengalami downtime"],
      baseline_shadow_hours: 42.5,
      version: 2,
      total_members: 5,
      acknowledgements: [
        {
          id: "ack-1000-uuid",
          user_id: "u-1",
          full_name: "Sinta Dewi",
          role_title: "Team Lead",
          workspace_role: "LEAD",
          signed_at: "2026-11-22T09:15:00.000Z",
        },
        {
          id: "ack-2000-uuid",
          user_id: "u-2",
          full_name: "Nadya Putri",
          role_title: "Desainer Kreatif",
          workspace_role: "MEMBER",
          signed_at: "2026-11-22T10:30:00.000Z",
        },
      ],
    });

    const rawPdf = doc.output("arraybuffer");
    const header = new TextDecoder().decode(new Uint8Array(rawPdf).slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });

  it("mendukung stempel PNG kustom maupun fallback stempel lingkaran vektor pada halaman 1 PDF", () => {
    const validOnePxPngDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    const docWithPng = buildCharterPdfDocument(
      {
        title: "Piagam Stempel Kustom",
        company_or_team_name: "Tim Kreatif",
        organization_name: "PT Nusantara Digital",
        organization_stamp_url: "https://example.com/stamp.png",
        quiet_hours_start: "18:00:00",
        quiet_hours_end: "08:00:00",
        non_urgent_sla_hours: 2,
        emergency_criteria: ["Server produksi mengalami downtime"],
        baseline_shadow_hours: 35,
        total_members: 4,
        acknowledgements: [
          {
            id: "abcd1234-0000-4000-8000-000000000001",
            user_id: "u-lead",
            full_name: "Sinta Dewi",
            role_title: "Team Lead",
            workspace_role: "LEAD",
            signed_at: "2026-11-23T11:10:00.000Z",
          },
        ],
      },
      { dataUrl: validOnePxPngDataUrl, width: 120, height: 120 }
    );

    const pngHeader = new TextDecoder().decode(
      new Uint8Array(docWithPng.output("arraybuffer")).slice(0, 5)
    );
    expect(pngHeader).toBe("%PDF-");

    const docFallback = buildCharterPdfDocument({
      title: "Piagam Stempel Default",
      company_or_team_name: "Tim Kreatif",
      organization_name: "PT Nusantara Digital",
      organization_stamp_url: null,
      quiet_hours_start: "18:00:00",
      quiet_hours_end: "08:00:00",
      non_urgent_sla_hours: 2,
      emergency_criteria: ["Server produksi mengalami downtime"],
      baseline_shadow_hours: null,
      total_members: 4,
      acknowledgements: [
        {
          id: "abcd1234-0000-4000-8000-000000000001",
          user_id: "u-lead",
          full_name: "Sinta Dewi",
          role_title: "Team Lead",
          workspace_role: "LEAD",
          signed_at: "2026-11-23T11:10:00.000Z",
        },
      ],
    });
    const fallbackHeader = new TextDecoder().decode(
      new Uint8Array(docFallback.output("arraybuffer")).slice(0, 5)
    );
    expect(fallbackHeader).toBe("%PDF-");
  });
});
