import { z } from "zod";
import {
  isEndTimeAfterStartTime,
  timeStringSchema,
  timezoneSchema,
  workDaysSchema,
  workPatternSchema,
} from "./common";

export const createOrganizationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama perusahaan atau organisasi minimal 2 karakter.")
      .max(100, "Nama perusahaan atau organisasi maksimal 100 karakter."),
    initial_workspace_name: z
      .string()
      .trim()
      .min(2, "Nama divisi pertama minimal 2 karakter.")
      .max(80, "Nama divisi pertama maksimal 80 karakter.")
      .optional(),
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

export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(["MEMBER", "LEAD"], {
    message: "Peran anggota hanya dapat diubah antara MEMBER dan LEAD.",
  }),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateWorkspaceMemberRoleInput = z.infer<
  typeof updateWorkspaceMemberRoleSchema
>;
