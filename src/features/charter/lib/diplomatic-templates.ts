import type { DiplomaticReplyInput } from "@/lib/validations";
import type {
  DiplomaticRecipient,
  DiplomaticReplyDraft,
  DiplomaticTimeContext,
  DiplomaticTone,
} from "../types";

const GREETING_BY_CONTEXT: Record<
  DiplomaticTimeContext,
  Record<DiplomaticTone, string>
> = {
  NIGHT: {
    FORMAL_CORPORATE: "Selamat malam",
    POLITE_STARTUP: "Halo, selamat malam",
    FIRM_PROFESSIONAL: "Selamat malam",
  },
  WEEKEND: {
    FORMAL_CORPORATE: "Selamat berakhir pekan",
    POLITE_STARTUP: "Halo, selamat berakhir pekan",
    FIRM_PROFESSIONAL: "Selamat berakhir pekan",
  },
  HOLIDAY: {
    FORMAL_CORPORATE: "Selamat berlibur",
    POLITE_STARTUP: "Halo, selamat hari libur",
    FIRM_PROFESSIONAL: "Selamat beristirahat di hari libur",
  },
};

const SALUTATION_BY_RECIPIENT: Record<
  DiplomaticRecipient,
  Record<DiplomaticTone, string>
> = {
  MANAGER: {
    FORMAL_CORPORATE: "Bapak/Ibu",
    POLITE_STARTUP: "Pak/Bu",
    FIRM_PROFESSIONAL: "Pak/Bu",
  },
  CLIENT: {
    FORMAL_CORPORATE: "Bapak/Ibu",
    POLITE_STARTUP: "Kak/Pak/Bu",
    FIRM_PROFESSIONAL: "Bapak/Ibu",
  },
  PEER: {
    FORMAL_CORPORATE: "Rekan",
    POLITE_STARTUP: "Teman-teman / Rekan",
    FIRM_PROFESSIONAL: "Rekan kerja",
  },
};

const OUTSIDE_HOURS_PHRASE: Record<DiplomaticTimeContext, string> = {
  NIGHT: "di luar jam operasional malam ini",
  WEEKEND: "pada akhir pekan ini",
  HOLIDAY: "di hari libur nasional",
};

const CLOSING_BY_RECIPIENT: Record<
  DiplomaticRecipient,
  Record<DiplomaticTone, string>
> = {
  MANAGER: {
    FORMAL_CORPORATE:
      "Terima kasih atas arahan dan pengertian Bapak/Ibu.",
    POLITE_STARTUP:
      "Terima kasih banyak atas pengertiannya ya, Pak/Bu.",
    FIRM_PROFESSIONAL:
      "Terima kasih atas kerja samanya menjaga ritme kerja tim.",
  },
  CLIENT: {
    FORMAL_CORPORATE:
      "Terima kasih atas kepercayaan dan kesabaran Bapak/Ibu.",
    POLITE_STARTUP:
      "Terima kasih atas kepercayaannya, kami kabari segera setelah masuk jam kerja.",
    FIRM_PROFESSIONAL:
      "Terima kasih atas pengertian Bapak/Ibu terhadap jam layanan tim kami.",
  },
  PEER: {
    FORMAL_CORPORATE:
      "Terima kasih atas koordinasi dan pengertiannya.",
    POLITE_STARTUP:
      "Makasih banyak pengertiannya ya, lanjut kita eksekusi di jam kerja.",
    FIRM_PROFESSIONAL:
      "Terima kasih sudah saling menghargai batas jam istirahat tim.",
  },
};

const ACTION_BY_TONE: Record<
  DiplomaticTone,
  { short: string; structured: string; firm: string }
> = {
  FORMAL_CORPORATE: {
    short: "Pesan telah kami catat dan akan langsung kami tindak lanjuti secara prioritas pada",
    structured:
      "Agar kualitas pengerjaan tetap optimal tanpa mengganggu ketelitian hasil, tindak lanjut akan kami jalankan pada",
    firm: "Sesuai kesepakatan jam kerja operasional, peninjauan menyeluruh akan kami lakukan pada",
  },
  POLITE_STARTUP: {
    short: "Pesan sudah masuk ke daftar antrean pagi dan siap langsung saya kerjakan mulai",
    structured:
      "Supaya hasilnya rapi dan matang, detail ini sudah saya masukkan ke antrean prioritas pertama pada",
    firm: "Saat ini saya sedang menjaga waktu istirahat di luar jam aktif, jadi eksekusi fokusnya akan saya mulai pada",
  },
  FIRM_PROFESSIONAL: {
    short: "Catatan pekerjaan sudah diterima dan dijadwalkan menjadi prioritas utama pada",
    structured:
      "Untuk menjaga akurasi pekerjaan serta ketertiban alur tim, pembahasan dan eksekusinya kami jadwalkan pada",
    firm: "Karena tidak termasuk kondisi darurat produksi, tindak lanjutnya kami proses penuh mulai",
  },
};

function cleanContextText(value: string): string {
  return value.trim().replace(/[.\s]+$/g, "");
}

function cleanWindowText(value: string): string {
  return value.trim().replace(/[.\s]+$/g, "");
}

export function generateTemplateReplies(
  input: DiplomaticReplyInput
): DiplomaticReplyDraft[] {
  const greeting = GREETING_BY_CONTEXT[input.time_context][input.tone];
  const salutation = SALUTATION_BY_RECIPIENT[input.recipient][input.tone];
  const outsidePhrase = OUTSIDE_HOURS_PHRASE[input.time_context];
  const closing = CLOSING_BY_RECIPIENT[input.recipient][input.tone];
  const action = ACTION_BY_TONE[input.tone];
  const contextText = cleanContextText(input.short_context);
  const workWindow = cleanWindowText(input.next_work_window);

  const shortReply =
    `${greeting} ${salutation}, terima kasih atas informasinya terkait "${contextText}". ` +
    `${action.short} ${workWindow}. ${closing}`;

  const structuredReply =
    `${greeting} ${salutation}. Arahan mengenai "${contextText}" yang dikirim ${outsidePhrase} ` +
    `sudah tercatat di papan antrean kerja. ${action.structured} ${workWindow}. ${closing}`;

  const priorityNote =
    input.recipient === "CLIENT"
      ? "Jika ada kendala layanan kritis yang berdampak langsung ke operasional aktif, silakan sertakan label Darurat."
      : "Jika tidak bersifat insiden darurat operasional, saya akan memberikan pembaruan progres pertama begitu jendela kerja dibuka.";

  const firmReply =
    `${greeting} ${salutation}. Terima kasih telah menyampaikan kebutuhan "${contextText}". ` +
    `${action.firm} ${workWindow}. ${priorityNote} ${closing}`;

  return [
    {
      label: "Singkat & Kooperatif",
      text: shortReply,
    },
    {
      label: "Terstruktur & Solutif",
      text: structuredReply,
    },
    {
      label: "Tegas & Berorientasi Prioritas",
      text: firmReply,
    },
  ];
}
