import { z } from "zod";
import { dateStringSchema } from "./common";

const heatmapRowSchema = z
  .array(z.number().int().min(0))
  .length(24, "Setiap baris heatmap wajib berisi tepat 24 jam (00-23).");

export const heatmapMatrixSchema = z
  .array(heatmapRowSchema)
  .length(7, "Heatmap wajib berisi tepat 7 hari (Senin-Minggu).");

export const createAuditSnapshotSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(2, "Label snapshot minimal 2 karakter.")
      .max(100, "Label snapshot maksimal 100 karakter."),
    period_start: dateStringSchema,
    period_end: dateStringSchema,
    total_messages: z.number().int().min(0),
    after_hours_messages: z.number().int().min(0),
    shadow_overtime_hours: z.number().min(0).max(9999.99),
    false_urgency_count: z.number().int().min(0),
    peak_day_of_week: z.number().int().min(1).max(7),
    peak_hour: z.number().int().min(0).max(23),
    heatmap_matrix: heatmapMatrixSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.period_end < data.period_start) {
      ctx.addIssue({
        code: "custom",
        path: ["period_end"],
        message: "Tanggal akhir periode tidak boleh sebelum tanggal mulai.",
      });
    }

    if (data.after_hours_messages > data.total_messages) {
      ctx.addIssue({
        code: "custom",
        path: ["after_hours_messages"],
        message:
          "Jumlah pesan luar jam reguler tidak boleh melebihi total pesan.",
      });
    }
  });

export type CreateAuditSnapshotInput = z.infer<
  typeof createAuditSnapshotSchema
>;
