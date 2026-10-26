
import { z } from "zod";

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(100).optional(),

  limit: z.coerce.number().int().min(1).max(100).optional(),

  search: z.string().trim().optional(),

  sortBy: z
    .enum(["id", "name", "email", "rollNumber", "branch", "year", "city"])
    .default("id"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),

  branch: z.string().trim().optional(),

  year: z.string().trim().optional(),

  city: z.string().trim().optional(),
}).strict().transform((query) => ({
  ...query,
  pageSize: query.pageSize ?? query.limit ?? 10,
}));

export type StudentQueryDto = z.infer<typeof studentQuerySchema>;
