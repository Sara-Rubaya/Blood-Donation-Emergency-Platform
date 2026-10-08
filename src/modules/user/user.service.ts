import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

// Never select `password` / `googleId`
const safeSelect = {
  id: true, name: true, email: true, phone: true, role: true, bloodGroup: true,
  city: true, isAvailable: true, isVerified: true, lastDonationAt: true, createdAt: true,
} as const;

export const getMe = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeSelect });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateMe = (id: string, data: Record<string, unknown>) =>
  prisma.user.update({ where: { id }, data, select: safeSelect });

export const listUsers = () =>
  prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: "desc" } });

// Postgres enforces foreign keys: a user with requests/matches/donations/payments can't be hard-deleted
export const deleteUser = async (id: string, actorId: string) => {
  if (id === actorId) throw new ApiError(400, "You cannot delete your own account");
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") throw new ApiError(404, "User not found");
    if (e.code === "P2003")
      throw new ApiError(409, "This user has requests, matches, donations or payments and cannot be deleted");
    throw e;
  }
};
