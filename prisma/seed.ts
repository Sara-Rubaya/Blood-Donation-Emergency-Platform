import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Must match the "Quick Demo Login" buttons in the frontend
const DEMO = [
  { name: "Demo Admin", email: "admin@blooddonation.com", password: "Admin@123", role: "ADMIN" as const, city: "Dhaka" },
  { name: "Demo Donor", email: "donor@blooddonation.com", password: "Donor@123", role: "DONOR" as const, bloodGroup: "O_POS" as const, city: "Dhaka", phone: "01700000000" },
  { name: "Demo Requester", email: "requester@blooddonation.com", password: "Requester@123", role: "REQUESTER" as const, city: "Dhaka", phone: "01800000000" },
];

async function main() {
  for (const { password, ...data } of DEMO) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email: data.email },
      update: { ...data, password: hashed },
      create: { ...data, password: hashed, isVerified: true },
    });
    console.log(`✅ ${data.role} → ${data.email} / ${password}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
