
import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").optional(),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().optional(),
  location: z.string().trim().optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update",
});

export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
