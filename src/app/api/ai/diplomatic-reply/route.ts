import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { generateTemplateReplies } from "@/features/charter/lib/diplomatic-templates";
import type { DiplomaticReplyDraft } from "@/features/charter/types";
import { checkRateLimit, extractClientIp } from "@/lib/api/rate-limit";
import {
  apiError,
  apiSuccess,
  formatZodIssues,
  parseJsonBody,
} from "@/lib/api/response";
import {
  diplomaticReplySchema,
  type DiplomaticReplyInput,
} from "@/lib/validations";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 5000;
const RATE_LIMIT_MAX_PER_MIN = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

const aiRepliesResponseSchema = z.object({
  replies: z
    .array(
      z.object({
        label: z.string().trim().min(2).max(60),
        text: z.string().trim().min(10).max(700),
      })
    )
    .length(3),
});

function sanitizeOutputText(value: string): string {
  return value.replace(/\u2014/g, " - ").replace(/\s+/g, " ").trim();
}

function buildFallbackResponse(
  input: DiplomaticReplyInput,
  reason: string
) {
  return apiSuccess(
    {
      source: "TEMPLATE_FALLBACK" as const,
      replies: generateTemplateReplies(input),
    },
    200,
    { fallback_reason: reason }
  );
}

function buildPrompt(input: DiplomaticReplyInput): string {
  return [
    "Susun tepat 3 variasi balasan WhatsApp berbahasa Indonesia untuk menunda instruksi non-darurat di luar jam kerja.",
    "Aturan wajib: tanpa emoji, tanpa tanda em-dash, sopan namun tegas menjaga batas jam kerja, dan sebutkan jendela kerja berikutnya secara persis.",
    "Label 3 variasi berturut-turut: 'Singkat & Kooperatif', 'Terstruktur & Solutif', dan 'Tegas & Berorientasi Prioritas'.",
    `Penerima (enum): ${input.recipient}`,
    `Konteks waktu (enum): ${input.time_context}`,
    `Nada komunikasi (enum): ${input.tone}`,
    `Jendela kerja berikutnya: ${input.next_work_window}`,
    `Konteks singkat tugas: ${input.short_context}`,
  ].join("\n");
}

async function generateWithGemini(
  apiKey: string,
  input: DiplomaticReplyInput
): Promise<DiplomaticReplyDraft[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(input),
      config: {
        abortSignal: controller.signal,
        temperature: 0.4,
        systemInstruction:
          "Anda adalah asisten komunikasi kerja profesional berbahasa Indonesia yang membantu pekerja menjaga batas jam kerja secara diplomatis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["label", "text"],
              },
            },
          },
          required: ["replies"],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty Gemini response text");
    }

    const parsedJson: unknown = JSON.parse(rawText);
    const validated = aiRepliesResponseSchema.parse(parsedJson);

    return validated.replies.map((item) => ({
      label: sanitizeOutputText(item.label),
      text: sanitizeOutputText(item.text),
    }));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  const bodyResult = await parseJsonBody(request);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const parsed = diplomaticReplySchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Parameter penyusun balasan diplomatis tidak valid.",
      400,
      formatZodIssues(parsed.error)
    );
  }

  const clientIp = extractClientIp(request);
  const rateLimit = checkRateLimit(
    `diplomatic-reply:${clientIp}`,
    RATE_LIMIT_MAX_PER_MIN,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rateLimit.allowed) {
    return buildFallbackResponse(parsed.data, "RATE_LIMITED");
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return buildFallbackResponse(parsed.data, "MISSING_API_KEY");
  }

  try {
    const replies = await generateWithGemini(apiKey, parsed.data);
    return apiSuccess({
      source: "AI" as const,
      replies,
    });
  } catch {
    return buildFallbackResponse(parsed.data, "AI_UNAVAILABLE");
  }
}
