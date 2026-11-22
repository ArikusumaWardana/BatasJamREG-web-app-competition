import { z } from "zod";

export const uuidSchema = z
  .string()
  .uuid("Format ID tidak valid (wajib UUID).");

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.");

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export const timeStringSchema = z
  .string()
  .trim()
  .regex(TIME_PATTERN, "Format waktu harus HH:MM atau HH:MM:SS.")
  .transform((value) => (value.length === 5 ? `${value}:00` : value));

export const timezoneSchema = z.enum([
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
]);

export const workPatternSchema = z.enum([
  "FIVE_DAYS_8H",
  "SIX_DAYS_7H",
  "CUSTOM",
]);

export const workDaysSchema = z
  .array(z.number().int().min(1).max(7))
  .min(1, "Pilih minimal satu hari kerja aktif.")
  .max(7, "Maksimal tujuh hari kerja dalam seminggu.")
  .refine(
    (days) => new Set(days).size === days.length,
    "Daftar hari kerja tidak boleh duplikat."
  );

export function timeToSeconds(value: string): number {
  const parts = value.split(":").map((part) => Number(part));
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export function isEndTimeAfterStartTime(start: string, end: string): boolean {
  return timeToSeconds(end) > timeToSeconds(start);
}
