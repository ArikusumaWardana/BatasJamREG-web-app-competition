import { describe, expect, it } from "vitest";
import type { DigestCardItem } from "../types";
import {
  filterDigestCardsByTab,
  formatMorningDigestWhatsApp,
} from "./wa-formatter";

const SAMPLE_CARDS: DigestCardItem[] = [
  {
    id: "card-1",
    workspace_id: "ws-1",
    author_id: "user-1",
    author_name: "Raka Pratama",
    title: "Revisi copywriting landing page",
    body: "Cek bagian FAQ\ndan sesuaikan subjudul sebelum rapat pukul 11.00 WIB.",
    recipient_label: "Tim Konten",
    triage_type: "MORNING_QUEUE",
    emergency_reason: null,
    status: "QUEUED",
    scheduled_for: "2026-11-23",
    dispatched_at: null,
    created_at: "2026-11-22T21:00:00.000Z",
    updated_at: "2026-11-22T21:00:00.000Z",
  },
  {
    id: "card-2",
    workspace_id: "ws-1",
    author_id: "user-2",
    author_name: "Dina Kartika",
    title: "Pembaruan banner promo desktop",
    body: "Gunakan rasio 16:9 pada hero banner terbaru.",
    recipient_label: "Tim Desain",
    triage_type: "MORNING_QUEUE",
    emergency_reason: null,
    status: "QUEUED",
    scheduled_for: "2026-11-23",
    dispatched_at: null,
    created_at: "2026-11-22T21:30:00.000Z",
    updated_at: "2026-11-22T21:30:00.000Z",
  },
  {
    id: "card-3",
    workspace_id: "ws-1",
    author_id: "user-1",
    author_name: "Raka Pratama",
    title: "Pemulihan callback gateway pembayaran",
    body: "Cek log error 502 server produksi.",
    recipient_label: "Tim Teknis",
    triage_type: "EMERGENCY_OPS",
    emergency_reason: "Layanan transaksi produksi tertahan sejak pukul 21.15 WIB.",
    status: "QUEUED",
    scheduled_for: "2026-11-22",
    dispatched_at: null,
    created_at: "2026-11-22T21:40:00.000Z",
    updated_at: "2026-11-22T21:40:00.000Z",
  },
  {
    id: "card-4",
    workspace_id: "ws-1",
    author_id: "user-1",
    author_name: "Raka Pratama",
    title: "Konfirmasi vendor cetak kalender",
    body: "Pilih vendor terbaik saat diskusi pagi.",
    recipient_label: "Tim Operasional",
    triage_type: "MORNING_QUEUE",
    emergency_reason: null,
    status: "DISPATCHED",
    scheduled_for: "2026-11-22",
    dispatched_at: "2026-11-22T01:30:00.000Z",
    created_at: "2026-11-21T20:00:00.000Z",
    updated_at: "2026-11-22T01:30:00.000Z",
  },
  {
    id: "card-5",
    workspace_id: "ws-1",
    author_id: "user-1",
    author_name: "Raka Pratama",
    title: "Insiden lama terarsip",
    body: "Sudah selesai minggu lalu.",
    recipient_label: "Tim Teknis",
    triage_type: "EMERGENCY_OPS",
    emergency_reason: "Gangguan DNS sementara minggu lalu sudah ditangani.",
    status: "ARCHIVED",
    scheduled_for: "2026-11-15",
    dispatched_at: null,
    created_at: "2026-11-15T20:00:00.000Z",
    updated_at: "2026-11-16T02:00:00.000Z",
  },
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
