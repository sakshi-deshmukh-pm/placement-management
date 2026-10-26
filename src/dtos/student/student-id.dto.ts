
import { z } from "zod";

export const studentIdSchema = z.object({
  id: z.coerce
    .number()
    .int("Student ID must be an integer")
    .positive("Student ID must be positive"),
}).strict();

export type StudentIdDto = z.infer<typeof studentIdSchema>;
