
import { z } from "zod";

export const updateInterviewSchema = z.object({
  applicationId: z.number().int().positive(
    "Application ID must be a positive integer",
  ).optional(),

  round: z.string().trim().min(1, "Interview round is required").optional(),

  scheduledAt: z.iso.datetime({
    error: "Enter a valid scheduled date and time",
  }).optional(),

  mode: z.string().trim().min(1, "Interview mode is required").optional(),

  meetingLink: z
    .string()
    .trim()
    .url("Enter a valid meeting URL")
    .optional()
    .or(z.literal("")),

  status: z.string().trim().min(1).optional(),

  feedback: z.string().trim().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Provide at least one field to update",
  },
);

export type UpdateInterviewDto = z.infer<typeof updateInterviewSchema>;
