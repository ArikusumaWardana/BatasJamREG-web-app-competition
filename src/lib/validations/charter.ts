import { z } from "zod";
import { timeStringSchema } from "./common";

export const createCharterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul piagam minimal 3 karakter.")
    .max(120, "Judul piagam maksimal 120 karakter."),
  company_or_team_name: z
    .string()
    .trim()
    .min(2, "Nama tim atau perusahaan minimal 2 karakter.")
    .max(100, "Nama tim atau perusahaan maksimal 100 karakter."),
  quiet_hours_start: timeStringSchema.default("18:00:00"),
  quiet_hours_end: timeStringSchema.default("08:00:00"),
  non_urgent_sla_hours: z.number().int().min(1).max(24).default(2),
  emergency_criteria: z
    .array(
      z
        .string()
        .trim()
        .min(3, "Kriteria darurat minimal 3 karakter.")
        .max(180, "Kriteria darurat maksimal 180 karakter.")
    )
    .min(1, "Tambahkan minimal satu kriteria darurat operasional.")
    .max(12, "Maksimal 12 kriteria darurat."),
  baseline_shadow_hours: z
    .number()
    .min(0)
    .max(9999.99)
    .nullable()
    .optional(),
});

export const diplomaticRecipientSchema = z.enum(["MANAGER", "CLIENT", "PEER"]);
export const diplomaticTimeContextSchema = z.enum([
  "NIGHT",
  "WEEKEND",
  "HOLIDAY",
]);
export const diplomaticToneSchema = z.enum([
  "FORMAL_CORPORATE",
  "POLITE_STARTUP",
  "FIRM_PROFESSIONAL",
]);

export const diplomaticReplySchema = z.object({
  recipient: diplomaticRecipientSchema,
  time_context: diplomaticTimeContextSchema,
  tone: diplomaticToneSchema,
  short_context: z
    .string()
    .trim()
    .min(5, "Konteks singkat minimal 5 karakter.")
    .max(200, "Konteks singkat maksimal 200 karakter."),
  next_work_window: z
    .string()
    .trim()
    .min(3, "Jendela kerja berikutnya minimal 3 karakter.")
    .max(60, "Jendela kerja berikutnya maksimal 60 karakter."),
});

export type CreateCharterInput = z.infer<typeof createCharterSchema>;
export type DiplomaticReplyInput = z.infer<typeof diplomaticReplySchema>;
