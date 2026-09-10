import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema, googleLoginSchema } from "./auth.validation";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);

export default router;
