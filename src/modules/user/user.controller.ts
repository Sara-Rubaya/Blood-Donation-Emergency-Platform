import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as service from "./user.service";

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  res.json(ApiResponse.success("Profile fetched", await service.getMe(req.user!.id)));
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
  res.json(ApiResponse.success("Profile updated", await service.updateMe(req.user!.id, req.body)));
});

export const listUsers = catchAsync(async (_req: AuthRequest, res: Response) => {
  res.json(ApiResponse.success("Users fetched", await service.listUsers()));
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  await service.deleteUser(req.params.id, req.user!.id);
  res.json(ApiResponse.success("User deleted"));
});
