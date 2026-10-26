
import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  rollNumber: z.string().trim().min(1, "Roll number is required"),

  branch: z.string().trim().min(1, "Branch is required"),

  year: z.string().trim().min(1, "Year is required"),

  phone: z.string().trim().optional(),

  gender: z.string().trim().optional(),

  dateOfBirth: z
    .union([
      z.iso.datetime(),
      z.iso.date(),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  city: z.string().trim().optional(),

  state: z.string().trim().optional(),

  pincode: z.string().trim().optional(),
}).strict();

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
