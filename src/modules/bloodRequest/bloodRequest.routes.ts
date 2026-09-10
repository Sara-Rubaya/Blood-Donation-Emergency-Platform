import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createRequestSchema,
  updateStatusSchema,
  respondToMatchSchema,
} from "./bloodRequest.validation";
import * as controller from "./bloodRequest.controller";

const router = Router();

// Public/browse
router.get("/", controller.listRequests);
router.get("/:id", controller.getRequest);

// Requester creates a request
router.post(
  "/",
  authenticate,
  authorize("REQUESTER", "ADMIN"),
  validate(createRequestSchema),
  controller.createRequest
);

// Requester/Admin updates overall status
router.patch(
  "/:id/status",
  authenticate,
  authorize("REQUESTER", "ADMIN"),
  validate(updateStatusSchema),
  controller.updateStatus
);

// Donor volunteers for a request
router.post("/:id/volunteer", authenticate, authorize("DONOR"), controller.volunteer);

// Requester/Admin accepts/rejects/completes a donor's match
router.patch(
  "/matches/:matchId",
  authenticate,
  authorize("REQUESTER", "ADMIN"),
  validate(respondToMatchSchema),
  controller.respondToMatch
);

export default router;
