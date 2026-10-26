
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().nullable().optional(),
    gender: z.string().trim().nullable().optional(),
    dateOfBirth: z.union([
      z.iso.datetime(),
      z.iso.date(),
      z.literal(""),
      z.null(),
    ]).optional(),
    city: z.string().trim().nullable().optional(),
    state: z.string().trim().nullable().optional(),
    pincode: z.string().trim().nullable().optional(),
  })
  .strict();

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
