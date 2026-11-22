import { strFromU8, unzipSync } from "fflate";
import { parseString, type Message } from "whatsapp-chat-parser";
import { analyzeParsedMessages } from "@/features/audit/lib/audit-metrics";
import type {
  WaWorkerRequest,
  WaWorkerResponse,
} from "@/features/audit/types";

interface WorkerScope {
  postMessage: (message: WaWorkerResponse) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WaWorkerRequest>) => void
  ) => void;
}

const workerScope = globalThis as unknown as WorkerScope;

// Simpan pesan ter-parse hanya di memori worker (Zone A Privacy Firewall)
let cachedMessages: Message[] = [];
let cachedSourceLabel = "Ekspor WhatsApp Lokal";

function extractChatText(fileName: string, buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if (fileName.toLowerCase().endsWith(".zip")) {
    const entries = unzipSync(bytes);
    const txtCandidates = Object.entries(entries)
      .filter(
        ([entryName]) =>
          !entryName.startsWith("__MACOSX/") &&
          entryName.toLowerCase().endsWith(".txt")
      )
      .sort((a, b) => {
        const aIsChat = a[0].toLowerCase().endsWith("_chat.txt") ? 1 : 0;
        const bIsChat = b[0].toLowerCase().endsWith("_chat.txt") ? 1 : 0;
        if (aIsChat !== bIsChat) return bIsChat - aIsChat;
        return b[1].byteLength - a[1].byteLength;
      });

    const selected = txtCandidates[0];
    if (!selected) {
      throw new Error(
        "Arsip ZIP tidak berisi file teks ekspor WhatsApp (.txt)."
      );
    }

    return strFromU8(selected[1]);
  }

  return new TextDecoder("utf-8").decode(bytes);
}

workerScope.addEventListener("message", (event) => {
  const payload = event.data;

  try {
    if (payload.type === "PARSE_FILE") {
      const rawText = extractChatText(payload.fileName, payload.buffer);
      const parsed = parseString(rawText);
      const validMessages = parsed.filter(
        (msg) => msg.author !== null && !Number.isNaN(msg.date.getTime())
      );

      if (validMessages.length === 0) {
        workerScope.postMessage({
          type: "ERROR",
          message:
            "Tidak ada pesan chat yang dapat dikenali. Pastikan file berasal dari ekspor WhatsApp (.txt atau .zip).",
        });
        return;
      }

      cachedMessages = validMessages;
      cachedSourceLabel = payload.fileName;

      const result = analyzeParsedMessages(
        cachedMessages,
        payload.config,
        cachedSourceLabel
      );
      workerScope.postMessage({ type: "RESULT", result });
      return;
    }

    if (payload.type === "REANALYZE") {
      if (cachedMessages.length === 0) {
        workerScope.postMessage({
          type: "ERROR",
          message: "Belum ada file chat yang dimuat untuk dihitung ulang.",
        });
        return;
      }

      const result = analyzeParsedMessages(
        cachedMessages,
        payload.config,
        cachedSourceLabel
      );
      workerScope.postMessage({ type: "RESULT", result });
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal memproses file chat WhatsApp secara lokal.";
    workerScope.postMessage({ type: "ERROR", message });
  }
});
