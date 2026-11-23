import { describe, expect, it } from "vitest";
import type { DigestCardItem } from "../types";
import {
  filterDigestCardsByTab,
  formatEmergencyWhatsAppMessage,
  formatMorningDigestWhatsApp,
} from "./wa-formatter";

function makeCard(
  id: string,
  overrides: Partial<DigestCardItem>
): DigestCardItem {
  return {
    id,
    workspace_id: "ws-1",
    author_id: "user-1",
    author_name: "Raka Pratama",
    title: "Judul instruksi",
    body: "Isi instruksi.",
    recipient_label: "Tim Konten",
    triage_type: "MORNING_QUEUE",
    emergency_reason: null,
    status: "QUEUED",
    scheduled_for: "2026-11-23",
    dispatched_at: null,
    created_at: "2026-11-22T21:00:00.000Z",
    updated_at: "2026-11-22T21:00:00.000Z",
    ...overrides,
  };
}

const SAMPLE_CARDS: DigestCardItem[] = [
  makeCard("card-1", {
    title: "Revisi copywriting landing page",
    body: "Cek bagian FAQ\ndan sesuaikan subjudul sebelum rapat pukul 11.00 WIB.",
    recipient_label: "Tim Konten",
  }),
  makeCard("card-2", {
    author_id: "user-2",
    author_name: "Dina Kartika",
    title: "Pembaruan banner promo desktop",
    body: "Gunakan rasio 16:9 pada hero banner terbaru.",
    recipient_label: "Tim Desain",
  }),
  makeCard("card-3", {
    title: "Pemulihan callback gateway pembayaran",
    body: "Cek log error 502 server produksi.",
    recipient_label: "Tim Teknis",
    triage_type: "EMERGENCY_OPS",
    emergency_reason:
      "Layanan transaksi produksi tertahan sejak pukul 21.15 WIB.",
    scheduled_for: "2026-11-22",
  }),
  makeCard("card-4", {
    title: "Konfirmasi vendor cetak kalender",
    body: "Pilih vendor terbaik saat diskusi pagi.",
    recipient_label: "Tim Operasional",
    status: "DISPATCHED",
    scheduled_for: "2026-11-22",
    dispatched_at: "2026-11-22T01:30:00.000Z",
  }),
  makeCard("card-5", {
    title: "Insiden lama terarsip",
    body: "Sudah selesai minggu lalu.",
    recipient_label: "Tim Teknis",
    triage_type: "EMERGENCY_OPS",
    emergency_reason: "Gangguan DNS sementara minggu lalu sudah ditangani.",
    status: "ARCHIVED",
    scheduled_for: "2026-11-15",
  }),
];

describe("formatMorningDigestWhatsApp", () => {
  it("memformat daftar kartu menjadi teks WhatsApp terstruktur tanpa em-dash", () => {
    const formatted = formatMorningDigestWhatsApp({
      workspaceName: "Tim Kreatif Nusantara",
      cards: SAMPLE_CARDS.slice(0, 2),
      date: new Date("2026-11-23T01:30:00.000Z"),
      timezone: "Asia/Jakarta",
    });

    expect(formatted).toContain(
      "*MORNING DIGEST - Tim Kreatif Nusantara (23 Nov 2026)*"
    );
    expect(formatted).toContain(
      "1. [Tim Konten] Revisi copywriting landing page"
    );
    expect(formatted).toContain(
      "2. [Tim Desain] Pembaruan banner promo desktop"
    );
    expect(formatted).toContain(
      "Total: 2 instruksi siap dikerjakan pada jam kerja reguler."
    );
    expect(formatted).not.toContain("\u2014");
  });

  it("mengembalikan string kosong bila daftar kartu kosong", () => {
    const formatted = formatMorningDigestWhatsApp({
      workspaceName: "Tim Kreatif Nusantara",
      cards: [],
    });

    expect(formatted).toBe("");
  });

  it("menormalkan jeda baris pada body kartu menjadi satu baris rapi", () => {
    const formatted = formatMorningDigestWhatsApp({
      workspaceName: "Tim Kreatif Nusantara",
      cards: [SAMPLE_CARDS[0]],
      date: new Date("2026-11-23T01:30:00.000Z"),
    });

    expect(formatted).toContain(
      "   Cek bagian FAQ dan sesuaikan subjudul sebelum rapat pukul 11.00 WIB."
    );
  });

  it("menyesuaikan tanggal header berdasarkan zona waktu Indonesia", () => {
    const utcEvening = new Date("2026-11-23T16:30:00.000Z"); // 23:30 WIB vs 01:30 (+1) WIT
    const wibText = formatMorningDigestWhatsApp({
      workspaceName: "Tim",
      cards: [SAMPLE_CARDS[0]],
      date: utcEvening,
      timezone: "Asia/Jakarta",
    });
    const witText = formatMorningDigestWhatsApp({
      workspaceName: "Tim",
      cards: [SAMPLE_CARDS[0]],
      date: utcEvening,
      timezone: "Asia/Jayapura",
    });

    expect(wibText).toContain("(23 Nov 2026)");
    expect(witText).toContain("(24 Nov 2026)");
  });

  it("mengabaikan kartu EMERGENCY_OPS dan kartu yang sudah berstatus DISPATCHED", () => {
    const formatted = formatMorningDigestWhatsApp({
      workspaceName: "Tim Kreatif Nusantara",
      cards: SAMPLE_CARDS,
      date: new Date("2026-11-23T01:30:00.000Z"),
    });

    expect(formatted).toContain("1. [Tim Konten] Revisi copywriting landing page");
    expect(formatted).toContain("2. [Tim Desain] Pembaruan banner promo desktop");
    expect(formatted).toContain("Total: 2 instruksi siap dikerjakan");
    expect(formatted).not.toContain("Pemulihan callback gateway pembayaran");
    expect(formatted).not.toContain("Konfirmasi vendor cetak kalender");
    expect(formatted).not.toContain("Insiden lama terarsip");
  });

  it("mengembalikan string kosong jika seluruh kartu bukan MORNING_QUEUE berstatus QUEUED", () => {
    const formatted = formatMorningDigestWhatsApp({
      workspaceName: "Tim Kreatif Nusantara",
      cards: [SAMPLE_CARDS[2], SAMPLE_CARDS[3], SAMPLE_CARDS[4]],
    });

    expect(formatted).toBe("");
  });
});

describe("formatEmergencyWhatsAppMessage", () => {
  it("memformat pesan darurat lengkap dengan alasan darurat dan catatan tanpa em-dash", () => {
    const formatted = formatEmergencyWhatsAppMessage(
      SAMPLE_CARDS[2],
      "Tim Kreatif Nusantara"
    );

    expect(formatted).toBe(
      [
        "*[DARURAT OPERASIONAL - Tim Kreatif Nusantara]*",
        "Instruksi: Pemulihan callback gateway pembayaran",
        "PIC: Tim Teknis",
        "Alasan Darurat: Layanan transaksi produksi tertahan sejak pukul 21.15 WIB.",
        "Catatan: Cek log error 502 server produksi.",
        "",
        "(Tercatat pada Audit Darurat BatasJamREG)",
      ].join("\n")
    );
    expect(formatted).not.toContain("\u2014");
  });

  it("menghilangkan baris Catatan saat description dan body kosong serta memakai fallback PIC", () => {
    const formatted = formatEmergencyWhatsAppMessage(
      {
        title: "Server gateway tidak merespons",
        assignee_name: " ",
        recipient_label: "",
        emergency_reason: "Checkout pelanggan gagal 502.",
        description: "   ",
      },
      "PT Maju Jaya"
    );

    expect(formatted).toContain("*[DARURAT OPERASIONAL - PT Maju Jaya]*");
    expect(formatted).toContain("PIC: Tim terkait");
    expect(formatted).toContain("Alasan Darurat: Checkout pelanggan gagal 502.");
    expect(formatted).not.toContain("Catatan:");
    expect(formatted).toContain("(Tercatat pada Audit Darurat BatasJamREG)");
    expect(formatted).not.toContain("\u2014");
  });

  it("menormalkan em-dash dan baris baru pada field alias assignee_name dan description", () => {
    const formatted = formatEmergencyWhatsAppMessage(
      {
        title: "Patch hotfix autentikasi \u2014 sesi token",
        assignee_name: "Tim Backend",
        emergency_reason: "Login produksi gagal 100%",
        description: "Cek env\ndan restart worker.",
      },
      "Divisi Platform"
    );

    expect(formatted).toContain("Instruksi: Patch hotfix autentikasi - sesi token");
    expect(formatted).toContain("PIC: Tim Backend");
    expect(formatted).toContain("Catatan: Cek env dan restart worker.");
    expect(formatted).not.toContain("\u2014");
  });
});

describe("filterDigestCardsByTab", () => {
  it("memisahkan kartu ke tab Antrean Pagi, Darurat Operasional, dan Sudah Terkirim", () => {
    const morning = filterDigestCardsByTab(SAMPLE_CARDS, "MORNING_QUEUE");
    const emergency = filterDigestCardsByTab(SAMPLE_CARDS, "EMERGENCY_OPS");
    const dispatched = filterDigestCardsByTab(SAMPLE_CARDS, "DISPATCHED");

    expect(morning.map((item) => item.id)).toEqual(["card-1", "card-2"]);
    expect(emergency.map((item) => item.id)).toEqual(["card-3"]);
    expect(dispatched.map((item) => item.id)).toEqual(["card-4"]);
  });

  it("mengecualikan kartu berstatus ARCHIVED dari semua tab aktif", () => {
    const morning = filterDigestCardsByTab(SAMPLE_CARDS, "MORNING_QUEUE");
    const emergency = filterDigestCardsByTab(SAMPLE_CARDS, "EMERGENCY_OPS");
    const dispatched = filterDigestCardsByTab(SAMPLE_CARDS, "DISPATCHED");

    const allIds = [...morning, ...emergency, ...dispatched].map((c) => c.id);
    expect(allIds).not.toContain("card-5");
  });
});
