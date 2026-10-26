
import { z } from "zod";

const studentFields = {
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  rollNumber: z.string().trim().min(1, "Roll number is required"),
  branch: z.string().trim().min(1, "Branch is required"),
  year: z.string().trim().min(1, "Year is required"),

  phone: z.string().trim().nullable().optional(),
  gender: z.string().trim().nullable().optional(),

  dateOfBirth: z
    .union([
      z.iso.datetime(),
      z.iso.date(),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  pincode: z.string().trim().nullable().optional(),
};

// PATCH: allow updating only the fields provided.
export const updateStudentSchema = z
  .object({
    name: studentFields.name.optional(),
    email: studentFields.email.optional(),
    rollNumber: studentFields.rollNumber.optional(),
    branch: studentFields.branch.optional(),
    year: studentFields.year.optional(),
    phone: studentFields.phone,
    gender: studentFields.gender,
    dateOfBirth: studentFields.dateOfBirth,
    city: studentFields.city,
    state: studentFields.state,
    pincode: studentFields.pincode,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// PUT: require all main student fields.
export const replaceStudentSchema = z
  .object(studentFields)
  .strict();

export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type ReplaceStudentDto = z.infer<typeof replaceStudentSchema>;
