
import { z } from "zod";

export const createPlacementDriveSchema = z.object({
  role: z.string().trim().min(1, "Job role is required"),

  package: z.number().positive("Package must be greater than 0"),

  eligibilityCriteria: z
    .string()
    .trim()
    .min(1, "Eligibility criteria is required"),

  deadline: z.iso.datetime({
    error: "Enter a valid deadline",
  }),

  status: z.enum(["OPEN", "CLOSED"]).optional(),

  companyId: z.number().int().positive(
    "Company ID must be a positive integer",
  ),
}).strict();

export type CreatePlacementDriveDto = z.infer<
  typeof createPlacementDriveSchema
>;
