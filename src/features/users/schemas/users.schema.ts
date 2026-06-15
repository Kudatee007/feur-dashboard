import { z } from "zod";

export const operationalStatusSchema = z.enum([
  "active",
  "inactive",
  "suspended",
  "blocked",
]);

export const updateStatusSchema = z.object({
  status: operationalStatusSchema,
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;