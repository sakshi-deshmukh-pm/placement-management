import { z } from "zod";

export const registerSchema = z
  .object({
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
  })
  .strict();

export type RegisterDto = z.infer<typeof registerSchema>;