import { z } from "zod";
import { dateStringSchema, uuidSchema } from "./common";

export const digestTriageSchema = z.enum(["MORNING_QUEUE", "EMERGENCY_OPS"]);
export const digestStatusSchema = z.enum(["QUEUED", "DISPATCHED", "ARCHIVED"]);

export const digestCardQuerySchema = z.object({
  status: digestStatusSchema.optional(),
  triage_type: digestTriageSchema.optional(),
});

export const createDigestCardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Judul instruksi minimal 3 karakter.")
      .max(140, "Judul instruksi maksimal 140 karakter."),
    body: z
      .string()
      .trim()
      .min(3, "Detail instruksi minimal 3 karakter.")
      .max(1000, "Detail instruksi maksimal 1000 karakter."),
    recipient_label: z
      .string()
      .trim()
      .min(1, "Label penerima tidak boleh kosong.")
      .max(60, "Label penerima maksimal 60 karakter.")
      .default("Semua Tim"),
    triage_type: digestTriageSchema.default("MORNING_QUEUE"),
    emergency_reason: z
      .string()
      .trim()
      .max(500, "Alasan darurat maksimal 500 karakter.")
      .nullable()
      .optional(),
    scheduled_for: dateStringSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.triage_type === "EMERGENCY_OPS") {
      const reason = data.emergency_reason?.trim() ?? "";
      if (reason.length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["emergency_reason"],
          message:
            "Alasan darurat wajib diisi minimal 10 karakter untuk Darurat Operasional.",
        });
      }
    }
  });

export const updateDigestCardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Judul instruksi minimal 3 karakter.")
      .max(140, "Judul instruksi maksimal 140 karakter.")
      .optional(),
    body: z
      .string()
      .trim()
      .min(3, "Detail instruksi minimal 3 karakter.")
      .max(1000, "Detail instruksi maksimal 1000 karakter.")
      .optional(),
    recipient_label: z
      .string()
      .trim()
      .min(1, "Label penerima tidak boleh kosong.")
      .max(60, "Label penerima maksimal 60 karakter.")
      .optional(),
    triage_type: digestTriageSchema.optional(),
    emergency_reason: z
      .string()
      .trim()
      .max(500, "Alasan darurat maksimal 500 karakter.")
      .nullable()
      .optional(),
    status: digestStatusSchema.optional(),
    scheduled_for: dateStringSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "Minimal satu kolom kartu harus diperbarui.",
      });
      return;
    }

    if (data.triage_type === "EMERGENCY_OPS") {
      const reason = data.emergency_reason?.trim() ?? "";
      if (reason.length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["emergency_reason"],
          message:
            "Alasan darurat wajib diisi minimal 10 karakter untuk Darurat Operasional.",
        });
      }
    }
  });

export const dispatchDigestCardsSchema = z.object({
  card_ids: z
    .array(uuidSchema)
    .min(1, "Pilih minimal satu kartu untuk dikirim.")
    .max(100, "Maksimal 100 kartu per pengiriman."),
});

export type CreateDigestCardInput = z.infer<typeof createDigestCardSchema>;
export type UpdateDigestCardInput = z.infer<typeof updateDigestCardSchema>;
export type DispatchDigestCardsInput = z.infer<typeof dispatchDigestCardsSchema>;
