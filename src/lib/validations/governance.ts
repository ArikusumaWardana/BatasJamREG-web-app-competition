import { z } from "zod";

const pulseScoreSchema = z
  .number({ message: "Skor harus berupa angka." })
  .int("Skor harus berupa bilangan bulat 1 sampai 5.")
  .min(1, "Skor minimal adalah 1.")
  .max(5, "Skor maksimal adalah 5.");

export const wellbeingPulseSchema = z.object({
  rest_quality: pulseScoreSchema,
  reply_pressure: pulseScoreSchema,
  boundary_clarity: pulseScoreSchema,
});

export const emergencyReviewSchema = z.object({
  emergency_review_status: z.enum(["VALID_EMERGENCY", "SHOULD_BE_QUEUED"], {
    message:
      "Status review hanya boleh VALID_EMERGENCY atau SHOULD_BE_QUEUED.",
  }),
});

export type WellbeingPulseInput = z.infer<typeof wellbeingPulseSchema>;
export type EmergencyReviewInput = z.infer<typeof emergencyReviewSchema>;
