import { z } from "zod";
import {
  isEndTimeAfterStartTime,
  timeStringSchema,
  timezoneSchema,
  workDaysSchema,
  workPatternSchema,
} from "./common";

export const createWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama workspace minimal 2 karakter.")
      .max(80, "Nama workspace maksimal 80 karakter."),
    work_pattern: workPatternSchema.default("FIVE_DAYS_8H"),
    work_start_time: timeStringSchema.default("09:00:00"),
    work_end_time: timeStringSchema.default("17:00:00"),
    digest_dispatch_time: timeStringSchema.default("08:30:00"),
    timezone: timezoneSchema.default("Asia/Jakarta"),
    work_days: workDaysSchema.default([1, 2, 3, 4, 5]),
  })
  .superRefine((data, ctx) => {
    if (!isEndTimeAfterStartTime(data.work_start_time, data.work_end_time)) {
      ctx.addIssue({
        code: "custom",
        path: ["work_end_time"],
        message: "Jam selesai kerja harus lebih besar dari jam mulai kerja.",
      });
    }
  });

export const updateWorkspaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama workspace minimal 2 karakter.")
      .max(80, "Nama workspace maksimal 80 karakter.")
      .optional(),
    work_pattern: workPatternSchema.optional(),
    work_start_time: timeStringSchema.optional(),
    work_end_time: timeStringSchema.optional(),
    digest_dispatch_time: timeStringSchema.optional(),
    timezone: timezoneSchema.optional(),
    work_days: workDaysSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Minimal satu pengaturan workspace harus diubah.",
      });
      return;
    }

    if (
      data.work_start_time !== undefined &&
      data.work_end_time !== undefined &&
      !isEndTimeAfterStartTime(data.work_start_time, data.work_end_time)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["work_end_time"],
        message: "Jam selesai kerja harus lebih besar dari jam mulai kerja.",
      });
    }
  });

export const joinWorkspaceSchema = z.object({
  invite_code: z
    .string()
    .trim()
    .min(4, "Kode undangan minimal 4 karakter.")
    .max(32, "Kode undangan maksimal 32 karakter.")
    .transform((code) => code.toUpperCase()),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
