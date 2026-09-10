import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as service from "./bloodRequest.service";

export const createRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const request = await service.createRequest(req.user!.id, req.body);
  res.status(201).json(ApiResponse.success("Blood request created", request));
});

export const listRequests = catchAsync(async (req: AuthRequest, res: Response) => {
  const { bloodGroup, city, status } = req.query as Record<string, string>;
  const requests = await service.listRequests({ bloodGroup, city, status });
  res.status(200).json(ApiResponse.success("Requests fetched", requests));
});

export const getRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const request = await service.getRequestById(req.params.id);
  res.status(200).json(ApiResponse.success("Request fetched", request));
});

export const updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const request = await service.updateRequestStatus(req.params.id, req.body.status);
  res.status(200).json(ApiResponse.success("Request status updated", request));
});

export const volunteer = catchAsync(async (req: AuthRequest, res: Response) => {
  const match = await service.volunteerForRequest(req.params.id, req.user!.id);
  res.status(201).json(ApiResponse.success("Volunteered for request", match));
});

export const respondToMatch = catchAsync(async (req: AuthRequest, res: Response) => {
  const match = await service.respondToMatch(req.params.matchId, req.body.status);
  res.status(200).json(ApiResponse.success("Match updated", match));
});
