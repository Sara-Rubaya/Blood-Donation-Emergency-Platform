import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { prisma } from "../../config/db";

const router = Router();

router.get(
  "/mine",
  authenticate,
  authorize("DONOR"),
  catchAsync(async (req: AuthRequest, res: Response) => {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.user!.id },
      orderBy: { donatedAt: "desc" },
      include: { request: { select: { patientName: true, hospitalName: true, city: true, bloodGroup: true } } },
    });
    res.json(ApiResponse.success("Donations fetched", donations));
  })
);

export default router;
