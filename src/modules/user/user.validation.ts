import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    bloodGroup: z
      .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"])
      .optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const userIdSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
