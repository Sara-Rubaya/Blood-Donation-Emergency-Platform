import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance (avoids exhausting DB connections in dev)
export const prisma = new PrismaClient();
