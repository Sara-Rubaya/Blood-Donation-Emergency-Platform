import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateMeSchema, userIdSchema } from "./user.validation";
import * as controller from "./user.controller";

const router = Router();
router.use(authenticate);

router.get("/me", controller.getMe);
router.patch("/me", validate(updateMeSchema), controller.updateMe);

router.get("/", authorize("ADMIN"), controller.listUsers);
router.delete("/:id", authorize("ADMIN"), validate(userIdSchema), controller.deleteUser);

export default router;
