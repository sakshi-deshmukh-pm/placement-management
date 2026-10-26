
import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("")),
  industry: z.string().trim().optional(),
  location: z.string().trim().optional(),
}).strict();

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
