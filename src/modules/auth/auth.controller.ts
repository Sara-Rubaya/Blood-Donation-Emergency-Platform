import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(ApiResponse.success("User registered successfully", result));
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.status(200).json(ApiResponse.success("Login successful", result));
});

export const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { idToken, role } = req.body;
  const result = await authService.loginWithGoogle(idToken, role);
  res.status(200).json(ApiResponse.success("Google login successful", result));
});
