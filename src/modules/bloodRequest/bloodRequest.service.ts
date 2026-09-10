import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

export const createRequest = (requesterId: string, payload: any) =>
  prisma.bloodRequest.create({
    data: { ...payload, requesterId, requiredBy: new Date(payload.requiredBy) },
  });

export const listRequests = (filters: { bloodGroup?: string; city?: string; status?: string }) =>
  prisma.bloodRequest.findMany({
    where: {
      bloodGroup: filters.bloodGroup as any,
      city: filters.city,
      status: filters.status as any,
    },
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { id: true, name: true, phone: true } } },
  });

export const getRequestById = async (id: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id },
    include: { matches: { include: { donor: { select: { id: true, name: true, phone: true } } } } },
  });
  if (!request) throw new ApiError(404, "Blood request not found");
  return request;
};

// Requester or Admin updates the request's overall status
export const updateRequestStatus = async (id: string, status: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, "Blood request not found");

  return prisma.bloodRequest.update({ where: { id }, data: { status: status as any } });
};

// A donor volunteers for a specific request (creates a match)
export const volunteerForRequest = async (requestId: string, donorId: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new ApiError(404, "Blood request not found");
  if (request.status !== "PENDING") throw new ApiError(400, "This request is no longer open for matching");

  const existing = await prisma.donationMatch.findUnique({
    where: { requestId_donorId: { requestId, donorId } },
  });
  if (existing) throw new ApiError(409, "You have already volunteered for this request");

  return prisma.$transaction(async (tx) => {
    const match = await tx.donationMatch.create({ data: { requestId, donorId } });
    await tx.bloodRequest.update({ where: { id: requestId }, data: { status: "MATCHED" } });
    return match;
  });
};

// Requester/Admin accepts or rejects a donor's match; COMPLETED logs the donation
export const respondToMatch = async (matchId: string, status: "ACCEPTED" | "REJECTED" | "COMPLETED") => {
  const match = await prisma.donationMatch.findUnique({ where: { id: matchId } });
  if (!match) throw new ApiError(404, "Match not found");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.donationMatch.update({
      where: { id: matchId },
      data: { status, respondedAt: new Date() },
    });

    if (status === "COMPLETED") {
      await tx.donation.create({
        data: { donorId: match.donorId, requestId: match.requestId, unitsDonated: 1 },
      });
      await tx.bloodRequest.update({ where: { id: match.requestId }, data: { status: "FULFILLED" } });
      await tx.user.update({ where: { id: match.donorId }, data: { lastDonationAt: new Date() } });
    }

    return updated;
  });
};
