
import { z } from "zod";

export const updateApplicationSchema = z.object({
  status: z.enum([
    "APPLIED",
    "SHORTLISTED",
    "SELECTED",
    "REJECTED",
  ]),
}).strict();

export type UpdateApplicationDto = z.infer<
  typeof updateApplicationSchema
>;
