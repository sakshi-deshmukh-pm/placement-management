
import { z } from "zod";

export const createApplicationSchema = z.object({
  placementDriveId: z.number().int().positive(
    "Placement Drive ID must be a positive integer",
  ),
}).strict();

export type CreateApplicationDto = z.infer<
  typeof createApplicationSchema
>;
