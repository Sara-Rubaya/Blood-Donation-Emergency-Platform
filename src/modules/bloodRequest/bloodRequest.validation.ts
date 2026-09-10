import { z } from "zod";

const bloodGroupEnum = z.enum([
  "A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG",
]);

export const createRequestSchema = z.object({
  body: z.object({
    patientName: z.string().min(2),
    bloodGroup: bloodGroupEnum,
    unitsNeeded: z.number().int().positive(),
    hospitalName: z.string().min(2),
    city: z.string().min(2),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    requiredBy: z.string().datetime({ message: "requiredBy must be an ISO date" }),
    notes: z.string().optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "MATCHED", "FULFILLED", "EXPIRED", "CANCELLED"]),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const respondToMatchSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED"]),
  }),
  params: z.object({ matchId: z.string().uuid() }),
});
