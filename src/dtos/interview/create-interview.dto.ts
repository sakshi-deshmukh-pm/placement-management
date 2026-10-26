
import { z } from "zod";

export const createInterviewSchema = z.object({
  applicationId: z.number().int().positive(
    "Application ID must be a positive integer",
  ),

  round: z.string().trim().min(1, "Interview round is required"),

  scheduledAt: z.iso.datetime({
    error: "Enter a valid scheduled date and time",
  }),

  mode: z.string().trim().min(1, "Interview mode is required").optional(),

  meetingLink: z
    .string()
    .trim()
    .url("Enter a valid meeting URL")
    .optional()
    .or(z.literal("")),

  status: z.string().trim().min(1).optional(),

  feedback: z.string().trim().optional(),
}).strict();

export type CreateInterviewDto = z.infer<typeof createInterviewSchema>;
