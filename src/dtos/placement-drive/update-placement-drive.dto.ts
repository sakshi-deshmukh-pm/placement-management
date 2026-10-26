
import { z } from "zod";

export const updatePlacementDriveSchema = z.object({
  role: z.string().trim().min(1, "Job role is required").optional(),

  package: z.number().positive(
    "Package must be greater than 0",
  ).optional(),

  eligibilityCriteria: z
    .string()
    .trim()
    .min(1, "Eligibility criteria is required")
    .optional(),

  deadline: z.iso.datetime({
    error: "Enter a valid deadline",
  }).optional(),

  status: z.enum(["OPEN", "CLOSED"]).optional(),

  companyId: z.number().int().positive(
    "Company ID must be a positive integer",
  ).optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Provide at least one field to update",
  },
);

export type UpdatePlacementDriveDto = z.infer<
  typeof updatePlacementDriveSchema
>;
