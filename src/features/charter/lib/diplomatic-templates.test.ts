import { describe, expect, it } from "vitest";
import type {
  DiplomaticRecipient,
  DiplomaticTimeContext,
  DiplomaticTone,
} from "../types";
import { generateTemplateReplies } from "./diplomatic-templates";

const RECIPIENTS: DiplomaticRecipient[] = ["MANAGER", "CLIENT", "PEER"];
const TIME_CONTEXTS: DiplomaticTimeContext[] = ["NIGHT", "WEEKEND", "HOLIDAY"];
const TONES: DiplomaticTone[] = [
  "FORMAL_CORPORATE",
  "POLITE_STARTUP",
  "FIRM_PROFESSIONAL",
];

describe("generateTemplateReplies", () => {
  it("menghasilkan tepat 3 variasi valid untuk seluruh 27 kombinasi skenario", () => {
    for (const recipient of RECIPIENTS) {
      for (const time_context of TIME_CONTEXTS) {
        for (const tone of TONES) {
          const replies = generateTemplateReplies({
            recipient,
            time_context,
            tone,
            short_context: "Revisi deck laporan bulanan kuartal keempat.",
            next_work_window: "Besok pukul 09.00 WIB",
          });

          expect(replies).toHaveLength(3);
          const labels = replies.map((item) => item.label);
          expect(labels).toEqual([
            "Singkat & Kooperatif",
            "Terstruktur & Solutif",
            "Tegas & Berorientasi Prioritas",
          ]);

          for (const draft of replies) {
            expect(draft.text.length).toBeGreaterThan(40);
            expect(draft.text).toContain("Besok pukul 09.00 WIB");
            expect(draft.text).toContain("Revisi deck laporan bulanan kuartal keempat");
            expect(draft.text).not.toContain("\u2014");
          }

          expect(new Set(replies.map((item) => item.text)).size).toBe(3);
        }
      }
    }
  });

  it("menghasilkan variasi berbeda saat nada atau penerima berubah", () => {
    const formalManager = generateTemplateReplies({
      recipient: "MANAGER",
      time_context: "NIGHT",
      tone: "FORMAL_CORPORATE",
      short_context: "Pembaruan angka anggaran",
      next_work_window: "Senin pukul 08.30 WIB",
    });

    const startupPeer = generateTemplateReplies({
      recipient: "PEER",
      time_context: "NIGHT",
      tone: "POLITE_STARTUP",
      short_context: "Pembaruan angka anggaran",
      next_work_window: "Senin pukul 08.30 WIB",
    });

    expect(formalManager[0]?.text).not.toBe(startupPeer[0]?.text);
    expect(formalManager[0]?.text).toContain("Bapak/Ibu");
    expect(startupPeer[0]?.text).toContain("Teman-teman / Rekan");
  });
});
