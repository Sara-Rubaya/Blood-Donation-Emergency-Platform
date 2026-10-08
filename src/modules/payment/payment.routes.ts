import { Router, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/db";

const PRIORITY_FEE_BDT = 150; // amount is decided here, never trusted from the browser

const initiateSchema = z.object({
  body: z.object({ requestId: z.string().uuid(), purpose: z.literal("PRIORITY_LISTING") }),
});
const confirmSchema = z.object({ body: z.object({ tran_id: z.string().min(1) }) });

const router = Router();
router.use(authenticate);

router.post(
  "/initiate",
  authorize("REQUESTER"),
  validate(initiateSchema),
  catchAsync(async (req: AuthRequest, res: Response) => {
    const request = await prisma.bloodRequest.findUnique({ where: { id: req.body.requestId } });
    if (!request || request.requesterId !== req.user!.id) throw new ApiError(404, "Request not found");

    const transactionId = `TXN-${randomUUID()}`;
    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        requestId: request.id,
        amount: PRIORITY_FEE_BDT,
        purpose: "PRIORITY_LISTING",
        provider: "test",
        transactionId,
      },
    });
    // With Stripe: create a Checkout Session here and also return { gatewayUrl: session.url }
    res.status(201).json(ApiResponse.success("Payment initiated", { transactionId, payment }));
  })
);

router.get(
  "/mine",
  catchAsync(async (req: AuthRequest, res: Response) => {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(ApiResponse.success("Payments fetched", payments));
  })
);

// TEST MODE ONLY: lets the owner mark their own payment as paid.
// For real money, remove this and flip status to SUCCESS from a verified Stripe webhook instead.
router.post(
  "/success",
  validate(confirmSchema),
  catchAsync(async (req: AuthRequest, res: Response) => {
    const payment = await prisma.payment.findUnique({ where: { transactionId: req.body.tran_id } });
    if (!payment || payment.userId !== req.user!.id) throw new ApiError(404, "Payment not found");
    const updated =
      payment.status === "SUCCESS"
        ? payment
        : await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
    res.json(ApiResponse.success("Payment confirmed", updated));
  })
);

export default router;
