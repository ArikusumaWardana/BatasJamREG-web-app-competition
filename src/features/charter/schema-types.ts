import type { z } from "zod";
import type {
  diplomaticRecipientSchema,
  diplomaticTimeContextSchema,
  diplomaticToneSchema,
} from "@/lib/validations";

export type DiplomaticRecipientSchema = z.infer<typeof diplomaticRecipientSchema>;
export type DiplomaticTimeContextSchema = z.infer<typeof diplomaticTimeContextSchema>;
export type DiplomaticToneSchema = z.infer<typeof diplomaticToneSchema>;
